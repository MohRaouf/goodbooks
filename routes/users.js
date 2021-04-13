
const deleteRate = require('../helpers/calculated_helper');
const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/user");
const calculatedHelper = require("../helpers/calculated_helper");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const BookModel = require("../models/book");
const jwt = require('jsonwebtoken');
const jwtHelpers = require('../helpers/jwt_helper')
const ReviewModel = require("../models/review");

/* Sign up New User */
userRouter.post("/signup", async (req, res) => {

    const userInstance = new UserModel({
        username: req.body.username,
        fname: req.body.fname,
        lname: req.body.lname,

        password: req.body.password,
        dob: req.body.dob,
        email: req.body.email,
        gender: req.body.gender,
        bookshelf:req.body.bookshelf,
        ...(req.body.photo ? { photo: req.body.photo } : {})
    })
    console.log(userInstance)
    await userInstance.save().then((user) => {
        console.log(`New User Added : ${user}`)
        return res.sendStatus(201);
    }).catch((err) => {
        console.error("====Error===>", err)
        if (err.code == 11000) { /* username duplication - conflict */
            return res.status(409).send("Duplicated Username")
        }
        return res.sendStatus(500)
    })
})

/* Login --> Send Access Token + Refresh Token */
userRouter.post("/login", async (req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    // Verify Login Info from Database
    const userInstance = await UserModel.findOne({ username: reqUsername })
        .catch((err) => {
            console.error(err)
            return res.sendStatus(503)
        })

    //User Found
    if (userInstance) {
        if (await userInstance.isValidPassword(reqPassword)) {

            const userId = { userId: userInstance.id }
            const accessToken = jwtHelpers.generateAcessToken(userId)
            const refreshToken = jwtHelpers.generateRefreshToken(userId)

            UserModel.updateOne({ _id: userInstance.id }, { refreshToken: refreshToken }).then((result) => {
                if (result) return res.json({ accessToken: accessToken, refreshToken: refreshToken })
                else return res.sendStatus(500)
            }).catch((err) => {
                console.log(err)
                return res.sendStatus(500)
            })

        } else {
            console.log("Invalid Username Or Password");
            return res.sendStatus(401);
        }
    } else {
        console.log("User Data NotFound");
        return res.sendStatus(403);
    }
});

/** get the logged in user info */
userRouter.get("/login",jwtHelpers.verifyAccessToken, async (req, res) => {
    const userId=req.userId;
   const userInstance= await UserModel.findById(userId).catch((err)=>{
        console.error(err)
        res.sendStatus(401)
    })
    if(userInstance==null){
        console.log("======== User Info Not Found =========")
        /** Clear the refresh token */
        await UserModel.updateOne({ _id: userId }, { refreshToken: null }, { new: true })
        .catch((err) => {
            console.error(err);
            return res.sendStatus(401)
        }).then(()=>{ return res.sendStatus(401)})
    }
    console.log("======== User Info Sent =========")
    return res.json(userInstance)
});


const removeBookFromShelf = async (res, userName, bookid)=>{
    try{
        result = await UserModel.findOneAndUpdate(
            { username: userName, "bookshelf.bookId": bookid },
                {
                    $pull: { bookshelf: { bookId: bookid } },
                })
                .then((doc)=>{return doc})
                .catch((err)=>{res.sendStatus(424); console.log("X[await catch removeBookFromShelf]\n",err); return -1})
        return result
    } catch(exception){
        console.log("X[removeBookFromShelf]\n")
        res.sendStatus(424)
        return -1
    }
}

const deleteReview = async (res, userid, bookid)=>{
    try{
       result = await ReviewModel.findOneAndDelete({
            userId: mongoose.Types.ObjectId(userid),
            bookId: mongoose.Types.ObjectId(bookid)
        })
        .then((doc)=>{return doc})
        .catch((err)=>{res.sendStatus(424); console.log("X[await catch deleteReview]\n"); return -1})
        return result
    }catch(exception){
        res.sendStatus(503)
        return -1

    }
}

const getBookInfoToDelete = async(res, reviewId)=>{
    try{
        result = BookModel.findOne({reviews: mongoose.Types.ObjectId(reviewId)})
        .then((doc)=>{return doc})
        .catch((err)=>{res.sendStatus(424); console.log("X[await catch getBookInfoToDelete]\n"); return -1})
        return result
    }catch(exception){
        res.sendStatus(503)
        return -1
    }
}

const updateBookInfo = async(res, bookAvgRate, ratingCount, userRate)=>{
    try{
        result = BookModel.findOneAndUpdate({ reviews: mongoose.Types.ObjectId(reviewId) },
        {
            $pull: { reviews: mongoose.Types.ObjectId(reviewId) },
            $set:{
                avgRating: calculatedHelper.deleteRateFromBook(bookAvgRate, ratingCount, parseInt(userRate)),
            },
            $inc: { ratingCount: ratingCount>0?-1:0},
        })
        .then((doc)=>{return doc})
        .catch((err)=>{res.sendStatus(424); console.log("X[await catch updatebookInfo]\n"); return -1})
        return result
    }catch(exception){
        console.log("X[updatebookInfo]\n",exception);
        res.sendStatus(503)
        return -1
    }
}

userRouter.delete("/remove_book", jwtHelpers.verifyAccessToken,async(req, res)=>{
    const reqUsername = req.body.username;
    const bookId = req.body.bookId;
    const userRate = req.body.userRate;
    const bookAvgRate = req.body.avgRate;
    userDoc= await removeBookFromShelf(res, reqUsername, bookId)


    if(userDoc != -1){
        console.log("======================= 1 ============================")
        console.log(userDoc)
        deleteReviewDoc = await deleteReview(res, userDoc._id, bookId)
        if(deleteReviewDoc != -1){
            console.log("====================== 2 =============================")
            console.log(deleteReviewDoc)
            getBookInfoToDeleteDoc = await getBookInfoToDelete(res, deleteReviewDoc._id)
            if(getBookInfoToDeleteDoc != -1){
                console.log("===================== 3 ==============================")
                console.log(getBookInfoToDeleteDoc)
                updateBookInfDoc = await updateBookInfo(res, deleteReviewDoc._id, bookAvgRate, getBookInfoToDeleteDoc.ractingCount, userRate)
            }
        }
    }
})


userRouter.delete("/remove_book_old", async (req, res) => {
    const reqUsername = req.body.username;
    const book = req.body.bookId;
    const userRate = req.body.userRate;
    const bookAvgRate = req.body.avgRate;
    await UserModel.findOneAndUpdate(
        { username: reqUsername, "bookshelf.bookId": book },
        {
            $pull: { bookshelf: { bookId: book } },
        },
    ).then((userDoc) => { //findOneAndUpdate starts
        console.log("BookId:", book)
        console.log("UserId:", userDoc._id)
        if(userDoc){
            ReviewModel.findOneAndDelete({
                userId: mongoose.Types.ObjectId(userDoc._id),
                bookId: mongoose.Types.ObjectId(book)
            },).then((reviewDocs)=>{
                console.log("review:", reviewDocs)
                BookModel.findOne(
                    {
                        reviews: mongoose.Types.ObjectId(reviewDocs._id)
                    }
                    ).then((reviewDoc)=>{
                    console.log("book:", reviewDoc)
                    console.log("book Id:", reviewDoc._id)
                    console.log("Rating count:", reviewDoc.ratingCount)
                    BookModel.findOneAndUpdate(
                        { reviews: mongoose.Types.ObjectId(reviewDocs._id) },
                        {
                            $pull: { reviews: mongoose.Types.ObjectId(reviewDocs._id) },
                            $set:{
                                avgRating: calculatedHelper.deleteRateFromBook(bookAvgRate, reviewDoc.ratingCount, parseInt(userRate)),
                            },
                            $inc: { ratingCount: reviewDoc.ratingCount>0?-1:0},
                        },
                        ).then((bookDoc)=>{
                            console.log("Updated Book info:", bookDoc)
                            res.send(200).status("DeletedOk")
                        }).catch((err)=>{
                            if(err){
                                console.log("Error happened in deletion step\n:", err)
                                res.send(503).status("BookDeleteErr")
                            }
                        })
                }).catch((err)=>{
                    if(err){
                        console.log("Error happened in searching step\n:", err)
                        res.send(503).status("BookSearchErr")
                    }
                })
            }).catch((err)=>{
                if(err){
                    console.log("Error happened in searching review step\n:", err)
                    res.send(503).status("ReviewErr")
                }
            })
        } 
    })
    .catch((err) => { //findOneAndUpdate ends
        if(err){
            console.log("\n---------------------------\nNo User found:\n---------------------------\n", err)
            res.send(503).status("UserSearchingErr")
        }
        console.log("\n---------------------------\nNo User found:\n---------------------------\n", err)
        res.sendStatus(404)
    })
})


/* Update Access Token */
userRouter.post("/refresh", async (req, res) => {


    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    console.log(`Body Refresh Token : ${refreshToken}`)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {
        if (err) return res.sendStatus(403)
        const userId = userInfo.userId;
        console.log(`Extracted UserId from RefreshToken ==> ${userId}`)

        const userInstance = await UserModel.findById(userId)
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })

        if (!userInstance) {
            console.error('User not found')
            return res.status(401).send(`User Doesn't Exist`)
        }
        console.log(`User Refresh Token : ${userInstance.refreshToken}`)
        if (userInstance.refreshToken != null && userInstance.refreshToken === refreshToken) {
            const newAccessToken = jwtHelpers.generateAcessToken({ userId: userId })
            console.log('Access Token Updated')
            return res.json({ accessToken: newAccessToken })
        }

        console.error('User Refresh Token Is not Set')
        return res.status(401).send(`User Refresh Token Is not Set`)
    })
})

/* Logout --> Delete User Refresh Token From DB */
userRouter.post("/logout", async (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {

        if (err) return res.sendStatus(403)
        const userId = userInfo.userId;
        console.log(`Extracted userId from RefreshToken ==> ${userId}`)

        const userInstance = await UserModel.updateOne({ _id: userId }, { refreshToken: null }, { new: true })
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })
        if (!userInstance) {
            console.error('User not found')
            return res.sendStatus(401)
        }
        console.log(`${userInstance}`)
        console.log(`User Logged out - Refresh Token Reset`)
        return res.sendStatus(200)
    })

})

/* User Book Shelf Info Info */
//first get user by id then make projection on bookshelf array to filter by status then slice [skip,limit ]for pagination
userRouter.get("/", jwtHelpers.verifyAccessToken, (req, res) => {
    var Status = req.query.status ? [req.query.status] : ["r", "c", "w"]
    var Page = req.query.pg ? req.query.pg : 0
    const user = UserModel.aggregate(
        [{ $match: { _id: mongoose.Types.ObjectId(req.userId) } }, {
            $project: {
                bookshelf: [{
                    $filter: {
                        input: '$bookshelf',
                        as: 'book',
                        cond: { $in: ["$$book.status", Status] },
                    }
                }], _id: 0
            }
        }], function (err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send(result[0].bookshelf[0].slice(Page * 3, Page * 3 + 3));
            }
        })
    console.log(user)
});



userRouter.patch("/:bookid", jwtHelpers.verifyAccessToken, async (req, res) => {
    const userId = req.userId;
    const bookId = req.params.bookId;
    const bookshelf = req.body.bookshelf;
    const rate = req.body.bookshelf.rate;
    const status = req.body.bookshelf.status;

    const newStatus = req.body.newStatus;
    const bookAvg = req.body.bookAvg;
    const newRate= req.body.newRate;

    try{
        await UserModel.findOneAndUpdate({username:username,'bookshelf.bookId':bookId},
        {
            ...(bookshelf.rate ? { "bookshelf.$.rate": newRate }: {}),
            ...(bookshelf.status ? { "bookshelf.$.status": newStatus}: {})

        }).then( (userDoc)=>{
                BookModel.findOne(
                    {_id :mongoose.Types.ObjectId(bookId)}
                ).then((bookDoc)=>{
                const oldRate = bookDoc.avgRating;
                const ratingCount = bookDoc.ratingCount;
                console.log(bookDoc)
                BookModel.findOneAndUpdate({_id :mongoose.Types.ObjectId(bookId)},{
                    $set:{
                        avgRating : calculatedHelper.editBookRate(bookAvg,ratingCount,rate,newRate)
                    }
                }).then((data)=>{
                    res.sendStatus(200)
                })
            })
        })
    }catch(e){ 
        res.sendStatus(503).sendStatus(e.message)
    } 
})
module.exports = userRouter;