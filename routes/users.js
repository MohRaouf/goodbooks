const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/user");
const authenticateToken = require("../helpers/methods");
const calculatedHelper = require("../helpers/calculated_helper");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const BookModel = require("../models/book");
const ReviewModel = require("../models/review");

const addReviewToReviews = async (res, userid, bookid, reviewBody)=>{
    try{
       result = await ReviewModel.create({
            userId: mongoose.Types.ObjectId(userid),
            bookId: mongoose.Types.ObjectId(bookid),
            body: reviewBody
        })
        .then((doc)=>{return doc})
        .catch((err)=>{res.sendStatus(424); console.log("[X] [await catch addReviewToReviews\]:\n====================\n"); return -1})
        return result
    }catch(exception){
        console.log("[X] [await catch addReviewToReviews\]:\n====================\n",exception);        res.sendStatus(503)
        return -1
    }
}

const addReviewToBook = async (res, bookid, reviewId)=>{
    try{
       result = await BookModel.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(bookid),
        },{
            $push:{
                reviews: mongoose.Types.ObjectId(reviewId)
            }
        })
        .then((doc)=>{return doc})
        .catch((err)=>{res.sendStatus(424); console.log("[X] [await catch addReviewToBook\]:\n====================\n"); return -1})
        return result
    }catch(exception){
        console.log("[X] [await catch addReviewToBook\]:\n====================\n",exception);        res.sendStatus(503)
        res.sendStatus(503)
        return -1
    }
}

userRouter.post("/add_review", async (req, res) => {
    const userId = req.body.userId;
    const bookId = req.body.bookId;
    const body =  req.body.body;
    reviewDoc= await addReviewToReviews(res, userId, bookId, body)
    if(reviewDoc != -1){
        console.log("======================= 1 ============================")
        console.log(reviewDoc)
        addToBook = await addReviewToBook(res, bookId, reviewDoc._id)
        if(addToBook != -1){
            console.log(addToBook)
            res.sendStatus(200)
        }
    }
})

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
