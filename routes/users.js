
const express = require("express");
const userRouter = express.Router();
const jwt = require('jsonwebtoken');
const jwtHelpers = require('../helpers/jwt_helper')
const calculatedHelper = require("../helpers/calculated_helper");
const userHelper = require("../helpers/user_helper");
const UserModel = require("../models/user");
const mongoose = require('mongoose');
const BookModel = require("../models/book");

/* Sign up New User */

userRouter.post("/signup", (req, res) => {
    const userInstance = new UserModel({
        username: req.body.username,
        fname: req.body.fname,
        lname: req.body.lname,
        password: req.body.password,
        dob: req.body.dob,
        email: req.body.email,
        gender: req.body.gender,
        bookshelf: req.body.bookshelf,
        ...(req.body.photo ? { photo: req.body.photo } : {})
    })
    userInstance.save().then((user) => {
        console.log(`New User Added : ${user.username}`)
        return res.status(201).end();
    }).catch((err) => {
        /* username duplication - conflict */
        if (err.code == 11000) return res.status(409).end()
        return res.status(500).end()
    })
})

/* Login --> status Access Token + Refresh Token */
userRouter.post("/login", async (req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;
    try {
        // Verify Login Info from Database
        const userInstance = await UserModel.findOne({ username: reqUsername })

        //User Found
        if (userInstance) {
            if (await userInstance.isValidPassword(reqPassword)) {

                const userId = { userId: userInstance.id }
                const accessToken = jwtHelpers.generateAccessToken(userId)
                const refreshToken = jwtHelpers.generateRefreshToken(userId)

                UserModel.updateOne({ _id: userInstance.id }, { refreshToken: refreshToken }).then((result) => {
                    if (result) return res.json({ accessToken: accessToken, refreshToken: refreshToken })
                    else return res.status(500).end();
                }).catch((err) => {
                    console.log(err)
                    return res.status(500).end()
                })
            } else {
                console.log("Invalid Username Or Password");
                return res.status(401).end();
            }
        } else {
            console.log("User Data NotFound");
            return res.status(401).end();
        }
    }
    catch (err) { return res.status(500).end() }
});

/** get the logged in user info */
userRouter.get("/login", jwtHelpers.verifyAccessToken, async (req, res) => {
    const userId = req.userId;
    try {
        const userInstance = await UserModel.findById(userId)
        if (userInstance == null) {  /** User Not Found Clear the refresh token */
            await UserModel.updateOne({ _id: userId }, { refreshToken: null }, { new: true })
            return res.status(401).end()
        }
        return res.json(userInstance)
    } catch (err) { return res.status(401).end() }
});

// userRouter.delete("/remove_book", async(req, res)=>{
userRouter.delete("/remove_book/:bookId/:userRate/:avgRate", jwtHelpers.verifyAccessToken, async(req, res)=>{
    console.log("REMOVE CALLED")
    const userId = req.userId;
    const reqUsername = req.params.username;
    const bookId = req.params.bookId;
    const userRate = req.params.userRate;
    const bookAvgRate = req.params.avgRate;
    console.log(req.params)
    userDoc= await userHelper.removeBookFromShelf(res, userId, bookId)
     if(userDoc==-2){
        console.log("couldn't update userModel and delete the book")
        return res.sendStatus(503).end()
     }
    if(userDoc != -1 && userDoc !=-2){
        console.log("======================= 1 ============================")
        console.log(userDoc)
        deleteReviewDoc = await userHelper.deleteReview(res, userDoc._id, bookId)
        if(deleteReviewDoc != -1){
            console.log("====================== 2 =============================")
            console.log(deleteReviewDoc)
            getBookInfoToDeleteDoc = await userHelper.getBookInfoToDelete(res, deleteReviewDoc._id)
            if(getBookInfoToDeleteDoc != -1){
                console.log("===================== 3 ==============================")
                console.log(getBookInfoToDeleteDoc)
                updateBookInfDoc = await userHelper.updateBookInfo(res, deleteReviewDoc._id, bookAvgRate, getBookInfoToDeleteDoc.ratingCount, userRate)
                if(updateBookInfDoc != -1)
                    res.sendStatus(200)
            }
        }
    }
})

userRouter.get("/get_book/:bookId", jwtHelpers.verifyAccessToken,  async (req, res) => {
    const userId = req.userId
    const bookId = req.params.bookId
    const book = await findBookAtUser(res, userId, bookId)
    console.log('########################################################################################################')
    if(book == -1){ // error happened
        return ;// already sent response
    }
    else if(book != -2){ // book found
        console.log(book)
        console.log('########################################################################################################')
        return res.json(book)
    }
})

/**
 * req body { ratings:{oldRate:, newRate:, avgRating:, ratingCount:}, status: }
 */
// edit rate
// add rate
// edit status
// add status
userRouter.patch("/assert_book/:bookId", jwtHelpers.verifyAccessToken, async (req, res) => {
    const userId = req.userId
    const rating = req.body.ratings
    const status = req.body.status
    const bookId = req.params.bookId
    const bookShelf = {bookId:bookId, status:status, rate: rating.newRate}

    addBookTo = 0
    console.log("Incoming request to add review: ", userId, bookId, rating, status, req.body)

    if(!userId){
        console.log("Guest detected")
        return  res.json({status: "NotFound"})
    }

    const book = await userHelper.findBookAtUser(res, userId, bookId)
    if(book == -1){
        return 
    }
    else if(book == -2){
        console.log("======================= 1 book not found at user ============================")
        console.log(book)
        addBookTo = await userHelper.addBook(res, userId, bookShelf)
    }
    if(book != -2 || addBookTo != 0){
        updated = false
        if(addBookTo == 0){ // then edit current book
            console.log("======================= 2 book exists. Updating usermodel... ============================")
            await UserModel.updateOne(
                { _id: mongoose.Types.ObjectId(userId), 'bookshelf.bookId':bookId},
                {"bookshelf.$.rate": rating.newRate, "bookshelf.$.status": status}
            ).then((doc)=>{
                console.log(doc)
                if(doc.nModified == 1){
                    updated =true
                }
            else
                console.log(doc)
            })
            .catch((err)=> {
                if(err){
                    console.log(err)
                    res.sendStatus(200).end()
                    return
                }
            })
        }
        if(updated && (rating.newRate != rating.oldRate)){
            console.log("======================= 3 Updating book exists. Updating entries... ============================")
            const editBookAvg = calculatedHelper.editBookRate(rating.avgRating, rating.ratingCount, rating.oldRate, rating.newRate)
            const addBookAvg = calculatedHelper.addRateToBook(rating.avgRating, rating.ratingCount, rating.newRate)
            BookModel.updateOne({_id :mongoose.Types.ObjectId(bookId)},{
                $set:{
                    avgRating: parseInt(rating.oldRate)==0? addBookAvg : editBookAvg
                },
                $inc: {ratingCount: parseInt(rating.oldRate)==0? 1: 0}
            }).then((doc)=>{
                console.log(doc)
                if(doc.nModified==1)//if it's modified then send ok
                    return res.sendStatus(200).end()
                else
                    return res.sendStatus(503).end()
            }).catch((err)=>{
                console.log(err)
                if(err) return res.sendStatus(503).end()
            })
        }
    }
})

// adds review to user if exists else add bookfirst then add review
userRouter.post("/add_review/:bookId", jwtHelpers.verifyAccessToken, async (req, res) => {
    // const userId = req.body.userId;
    const userId = req.userId;
    const bookId = req.params.bookId;
    const reviewBody =  req.body.reviewBody;
    const bookShelf =  {rate:0, status:"r", bookId:bookId};
    if(!userId){
        console.log("Guest detected")
        return  res.json({status: "NotFound"})
    }

    console.log("Incoming request to add review: ", userId, bookId, reviewBody, bookShelf)
    const book = await userHelper.findBookAtUser(res, userId, bookId)
    addBookTo = 0
    if(book == -1){
        console.log("======================= 1 book found at user ============================")
        console.log(book)
        addBookTo = await userHelper.addBook(res, userId, bookShelf)
    }
    if(book != -1 || addBookTo !=0){
        console.log("[Successful]\nBookdetails:\n",book, "[Status] Book added status: ",addBookTo)
        reviewDoc= await userHelper.addReviewToReviews(res, userId, bookId, reviewBody)
        if(reviewDoc != -1){
            console.log("======================= 2 ============================")
            console.log(reviewDoc)
            addToBook = await userHelper.addReviewToBook(res, bookId, reviewDoc._id)
            if(addToBook != -1){
                console.log(addToBook)
                res.sendStatus(200)
            }    
        }
    }
})



userRouter.post("/add_book", jwtHelpers.verifyAccessToken, async (req, res) => {
    const reqUserId = req.body.userId;
    const bookshelf = req.body.bookshelf;
    const user = await userHelper.addBook(res, reqUserId, bookshelf)
    if(user != -1){
        console.log("======================= 1 ============================")
        console.log(user)
        res.sendStatus(200)
    }
})

/* Update Access Token */
userRouter.post("/refresh", async (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.status(401).end();
    console.log(`Body Refresh Token : ${refreshToken}`)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {
        if (err) return res.status(403).end()
        const userId = userInfo.userId;
        console.log(`Extracted UserId from RefreshToken ==> ${userId}`)

        const userInstance = await UserModel.findById(userId)
            .catch((err) => {
                console.error(err);
                return res.status(503).end()
            })

        if (!userInstance) {
            console.error('User not found')
            return res.status(401).end()
        }
        console.log(`User Refresh Token : ${userInstance.refreshToken}`)
        if (userInstance.refreshToken != null && userInstance.refreshToken === refreshToken) {
            const newAccessToken = jwtHelpers.generateAccessToken({ userId: userId })
            console.log('Access Token Updated')
            return res.json({ accessToken: newAccessToken })
        }

        console.error('User Refresh Token Is not Set')
        return res.status(401).end()
    })
})
/* Logout --> Delete User Refresh Token From DB */
userRouter.post("/logout", async (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.status(401).end();
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {

        if (err) return res.status(403)
        const userId = userInfo.userId;
        console.log(`Extracted userId from RefreshToken ==> ${userId}`)

        const userInstance = await UserModel.updateOne({ _id: userId }, { refreshToken: null }, { new: true })
            .catch((err) => {
                console.error(err);
                return res.status(503)
            })
        if (!userInstance) {
            console.error('User not found')
            return res.status(401)
        }
        console.log(`${userInstance}`)
        console.log(`User Logged out - Refresh Token Reset`)
        return res.status(200)
    })
})

/* User Book Shelf Info Info */
//first get user by id then make projection on bookshelf array to filter by status then slice [skip,limit ]for pagination
userRouter.get("/:status", jwtHelpers.verifyAccessToken, async (req, res) => {
    var userId = req.userId
    // console.log("[In Bookshelf data] UserId:",userId)
    console.log(req.params.status)
    var Status = req.params.status !== "a" ? [req.params.status] : ["r", "c", "w"]
    var Page = req.query.pg ? req.query.pg : 0
    try{
            // const user = UserModel.aggregate(
            //     [{ $match: { _id: mongoose.Types.ObjectId(req.userId) } }, {
            //         $project: {
            //             bookshelf: [{
            //                 $filter: {
            //                     input: '$bookshelf',
            //                     as: 'book',
            //                     cond: { $in: ["$$book.status", Status] },
            //                 }
            //             }], _id: 0
            //         }
            //     }], function (err, result) {
            //         if (err) {
            //             res.send(err);
            //         } else {
            //             result[0].bookshelf[0].populate({path: "bookshelf.bookId", select:"-reviews"})
            //         }
            //     })
            // console.log(user)
        UserModel.find({_id:  mongoose.Types.ObjectId(userId)})
        .select("bookshelf").where(`bookshelf.status === w`)
        .populate({path: "bookshelf.bookId", select:"-reviews", 
        populate:[
            {path: "authorId", select:"_id fname lname"}, 
            {path: "categoryId", select:"_id name"}
            ] })
            .exec(function (err, doc) {
            if (err) {
                console.log(err)
                return handleError(err);

            }
            // console.log('The doc is: ', doc);
            // console.log('The doc length is: ', doc.length);
            // console.log('The doc is: ', doc[0].bookshelf[0]);
            // console.log('The doc is: ', doc[0].bookshelf[1]);
            res.json({status:200, result: doc[0].bookshelf})
            return;
            // prints "The author is Ian Fleming"
          });
    }catch(err){
        res.json({status:501, result:{}})
        return;
    }
    console.log("***************************************")
});

// update only user rate
/*
req body:
    { username:, rateInfo:{ avgRating:, userRate:, ratingCount:} }
req params:
    userId: //should be in the token
ratingCount // front end will have it in the book data
*/
userRouter.post("/add_rate/:bookId", jwtHelpers.verifyAccessToken, async (req, res) => {
    console.log(req.params)
    console.log(req.body)
    const userId = req.userId;
    const bookId = req.params.bookId;
    const username = req.body.username;
    const rating = req.body.rateInfo;
    try{
        await UserModel.updateOne(
            { _id: mongoose.Types.ObjectId(userId), 'bookshelf.bookId':bookId},
            {"bookshelf.$.rate": rating.newRate}
        ).then( (userDoc)=>{
            console.log(userDoc);
            if(userDoc!= null && userDoc.nModified==1){//if it's modified then update in the bookModel
                BookModel.updateOne({_id :mongoose.Types.ObjectId(bookId)},{
                    $set:{
                        avgRating: calculatedHelper.addRateToBook(rating.avgRating, rating.ratingCount, rating.userRate)
                    },
                    $inc:{
                        ratingCount: 1
                    }
                }).then((data)=>{
                    console.log(data);
                    if(data!= null && data.nModified==1)//if it's modified then send ok to frontend
                        {console.log(data)
                            return res.sendStatus(200)
                        }
                    else
                    {console.log(data);
                        return res.sendStatus(503)}   
                }).catch((err)=>{
                    console.log(err);

                    if(err) return res.sendStatus(503)
                })
            }
            else if(userDoc!= null && userDoc.n==0){
                
            }
            else
                return res.sendStatus(503)
        }).catch((err)=>{
            console.log(err);
            if(err) return res.sendStatus(503)
        })
    }catch(e){
        return res.sendStatus(503)
    }
})

userRouter.patch("/user_book",  async (req, res) => {
    const userId = req.body.username;
    const bookId = req.params.bookId;
    try{
        UserModel.findOne({username:  mongoose.Types.ObjectId(userId), 'bookshelf.bookId':bookId},
        {_id: 0, shapes: {$elemMatch: {'bookshelf.bookId':bookId}}}
        )
        .then()
        .catch()
    }catch(e){
            return res.sendStatus(503)
        }
})

userRouter.patch("/edit_rate/:bookId", jwtHelpers.verifyAccessToken, async (req, res) => {
    console.log(req.params)
    console.log(req.body)
    const userId = req.userId;
    const bookId = req.params.bookId;

    const username = req.body.username;
    const rating = req.body.rateInfo;
    try{
        await UserModel.updateOne(
            { _id: mongoose.Types.ObjectId(userId), 'bookshelf.bookId':bookId},
            {"bookshelf.$.rate": rating.newRate}
        ).then( (userDoc)=>{
            if(userDoc!= null && userDoc.nModified==1){//if it's modified then update in the bookModel
                BookModel.updateOne({_id :mongoose.Types.ObjectId(bookId)},{
                    $set:{
                        avgRating: calculatedHelper.editBookRate(rating.avgRating, rating.ratingCount, rating.oldRate, rating.newRate)
                    }
                }).then((data)=>{
                    if(data!= null && data.nModified==1)//if it's modified then send ok to frontend
                        return res.sendStatus(200)   
                    else
                        return res.sendStatus(503)   
                }).catch((err)=>{
                    if(err) return res.sendStatus(503)
                })
            }
            else
                return res.sendStatus(503)
        }).catch((err)=>{
            if(err) return res.sendStatus(503)
        })
    }catch(e){
        return res.sendStatus(503)
    }
})

// update only book status
/*
req body:
    {status:, username: //used only in testing}
req params:
    userId: // should be in the token
*/
userRouter.patch("/edit_book_status/:bookId", jwtHelpers.verifyAccessToken, async (req, res) => {
    console.log(req.params)
    console.log(req.body)
    const userId = req.userId;
    const username = req.body.username;
    const bookId = req.params.bookId;
    const newStatus = req.body.status;
    try{
        await UserModel.updateOne(
            { _id: mongoose.Types.ObjectId(userId),'bookshelf.bookId':bookId},
            {"bookshelf.$.status": newStatus}
        ).then((userDoc)=>{
            console.log(userDoc)
            if(userDoc != null && userDoc.nModified == 1){//if it's modified then send ok to frontend
                console.log(userDoc)
                return res.sendStatus(200)
            }
            else
                return res.sendStatus(503)
        }).catch((err)=>{
            if(err) return res.sendStatus(503)
        })
    }catch(e){ 
        return res.sendStatus(503)
    } 
})

/** req body: {username:, fname:, lname:, dob:, gender:, password:, email:, }*/
userRouter.patch("/update_userinfo/:userId", async (req, res) => {
    const info = req.body.info
    try{
        await UserModel.updateOne({_id: mongoose.Types.ObjectId(userId)},
        {
            $set:{
                username: info.username,
                fname: info.fname,
                lname: info.lname,
                dob: info.dob,
                gender: info.gender,
                email: info.email
            }
        }
        ).then((doc)=>{
            if(doc.nModified == 1){
                console.log("FOUND AND UPDATED")
                res.json({status:200})
                return
            }
            else{
                res.json({status:503})
                return
            }
        }).catch((err)=>{
            if(err){
                console.log("FOUND AND UPDATED")
                res.json({status:503})
                return
            }
        })
    }
    catch(err){
        console.log(err)
        res.json({status:503})
        return
    }
})

userRouter.get("/get_user/:userId",  async (req, res) => {
    console.log("################################################################\n")
    try{
        console.log("################################################################\n")
        const userId = req.params.userId
        await UserModel.find({_id: userId})
        .then((doc)=>{
            if(doc){
                console.log("################################################################\n",doc)
                return res.json({status:200, result:{doc}})
            }
            else{
                console.log("############################ERRRRR####################################\n")
                console.log("ERR", doc)
                return res.json({status:400, result:{}})
            };
        }).catch((err)=>{
            console.log("############################ERRRRR CATCH####################################\n")
            console.log("ERR", doc)
            return res.json({status:400, result:{}})

        })
    }catch(err){
        console.log(doc)
        return res.json({status:503, result:{}})

    }
})
module.exports = userRouter;
