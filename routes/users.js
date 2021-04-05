const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/user");
const authenticateToken = require("../helpers/methods");
const calculatedHelper = require("../helpers/calculated_helper");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const BookModel = require("../models/book");
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
        ...(req.body.photo ? { photo: req.body.photo } : {}),
    });
    await userInstance
        .save()
        .then((user) => {
            console.log(`New User Added : ${user}`);
            res.sendStatus(201);
        })
        .catch((err) => {
            console.error("====Error===>", err);
            if (err.code == 11000) {
                return res.status(409).send("Duplicated Username"); // username duplication - conflict
            }
            res.sendStatus(500);
        });
});

/* Login --> Send Access Token + Refresh Token */
userRouter.post("/login", async (req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    // Verify Login Info from Database
    const userInstance = await UserModel.findOne({ username: reqUsername }).catch(
        (err) => {
            console.error(err);
            return res.sendStatus(503);
        }
    );
    //Username Found
    if (userInstance) {
        if (await bcrypt.compare(reqPassword, userInstance.password)) {
            console.log(`User ${reqUsername} Logged In Successfully`);

            const username = { username: reqUsername };
            const accessToken = generateAcessToken(username);
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET);

            UserModel.updateOne(
                { username: reqUsername },
                { refreshToken: refreshToken },
                { new: true }
            ).catch((err) => {
                console.error("====Error===>", err);
                return res.sendStatus(500);
            });

            return res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
            console.log("Invalid Username Or Password");
            return res.sendStatus(401);
        }
    } else {
        console.log("User Data NotFound");
        return res.sendStatus(403);
    }
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

userRouter.delete("/test_remove", async(req, res)=>{
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


userRouter.delete("/remove_book", async (req, res) => {
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



/* Logout --> Delete User Refresh Token From DB */
userRouter.get("/logout", async (req, res) => {
    const refreshToken = req.body.refToken;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, user) => {
            if (err) return res.sendStatus(403);
            const username = user.username;
            console.log(`Extracted Username from RefreshToken ==> ${username}`);

            const userInstance = await UserModel.findOne({
                username: username,
            }).catch((err) => {
                console.error(err);
                return res.sendStatus(503);
            });

            if (!userInstance) {
                console.error(`Admin Doesn't Exist`);
                return res.status(404).send(`Admin Doesn't Exist`);
            }

            if (
                userInstance.refreshToken != null &&
                userInstance.refreshToken === refreshToken
            ) {
                console.log(`${userInstance.refreshToken}`);
                const newAccessToken = generateAcessToken({ username: user.username });
                console.log("Access Token Updated");
                return res.json({ accessToken: newAccessToken });
            }

            console.error("User Refresh Token Is not found"); //null
            return res.status(401).send(`${username} Logged Out`);
        }
    );
});

/* User Book Shelf Info Info */
userRouter.get("/", authenticateToken, async (req, res) => {
    const username = req.user;
    const userInfo = await UserModel.findOne({ username: username }).catch(
        (err) => {
            console.error(err);
            return res.sendStatus(503);
        }
    );

    // Check of  Query String for Page Numer and Book Status then Apply Filters on the USER bookshelf
    /////////////////////////////////////////////////////////////////////////////////////////////////
    return res.json(userInfo);
});

module.exports = userRouter;
