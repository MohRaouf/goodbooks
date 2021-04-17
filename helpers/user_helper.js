const mongoose = require('mongoose');
const UserModel = require("../models/user");
const BookModel = require("../models/book");
const ReviewModel = require("../models/review");

addBook = async (res, userId, userBookshelf)=>{
    try{
       result = await UserModel.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(userId),
        },{
            $push: { bookshelf: userBookshelf },
        })
        .then((doc)=>{
            if(doc.nModified==1) return doc
            else return -1
        })
        .catch((err)=>{if(err){res.sendStatus(424); console.log("[X] [await catch addBook\]:\n====================\n"); return -1}})
        return result
    }catch(exception){
        console.log("[X] [await catch addBook\]:\n====================\n",exception);        res.sendStatus(503)
        res.sendStatus(503)
        return -1
    }
}

removeBookFromShelf = async (res, userId, bookid)=>{
    try{
        result = await UserModel.findOneAndUpdate(
            { _id: mongoose.Types.ObjectId(userId), "bookshelf.bookId": bookid },
                {
                    $pull: { bookshelf: { bookId: bookid } },
                })
                .then((doc)=>{if(doc.nModified==1)return doc; else return -2})
                .catch((err)=>{res.sendStatus(424); console.log("[X] [await catch removeBookFromShelf\]:\n====================\n",err); return -1})
        return result
    } catch(exception){
        console.log("[X] [removeBookFromShelf\]:\n====================\n")
        res.sendStatus(424)
        return -1
    }
}

deleteReview = async (res, userid, bookid)=>{
    try{
       result = await ReviewModel.findOneAndDelete({
            userId: mongoose.Types.ObjectId(userid),
            bookId: mongoose.Types.ObjectId(bookid)
        })
        .then((doc)=>{return doc})
        .catch((err)=>{res.sendStatus(424); console.log("[X] [await catch deleteReview\]:\n====================\n"); return -1})
        return result
    }catch(exception){
        res.sendStatus(503)
        return -1

    }
}

getBookInfoToDelete = async(res, reviewId)=>{
    try{
        result = BookModel.findOne({reviews: mongoose.Types.ObjectId(reviewId)})
        .then((doc)=>{return doc})
        .catch((err)=>{res.sendStatus(424); console.log("[X] [await catch getBookInfoToDelete\]:\n====================\n"); return -1})
        return result
    }catch(exception){
        res.sendStatus(503)
        return -1
    }
}

updateBookInfo = async(res, reviewId, bookAvgRate, ratingCount, userRate)=>{
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
        .catch((err)=>{res.sendStatus(424); console.log("[X] [await catch updatebookInfo\]:\n====================\n", err); return -1})
        return result
    }catch(exception){
        console.log("[X] [updatebookInfo\]:\n====================\n",exception);
        res.sendStatus(503)
        return -1
    }
}

addReviewToReviews = async (res, userid, bookid, reviewBody)=>{
    try{
       result = await ReviewModel.create({
            userId: mongoose.Types.ObjectId(userid),
            bookId: mongoose.Types.ObjectId(bookid),
            body: reviewBody
        })
        .then((doc)=>{return doc})
        .catch((err)=>{if(err) {res.sendStatus(424); console.log("[X] [await catch addReviewToReviews\]:\n====================\n"); return -1}})
        return result
    }catch(exception){
        console.log("[X] [await catch addReviewToReviews\]:\n====================\n",exception);        res.sendStatus(503)
        return -1
    }
}

addReviewToBook = async (res, bookid, reviewId)=>{
    try{
       result = await BookModel.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(bookid),
        },{
            $push:{
                reviews: mongoose.Types.ObjectId(reviewId)
            }
        })
        .then((doc)=>{return doc})
        .catch((err)=>{if(err){res.sendStatus(424); console.log("[X] [await catch addReviewToBook\]:\n====================\n"); return -1}})
        return result
    }catch(exception){
        console.log("[X] [await catch addReviewToBook\]:\n====================\n",exception);        res.sendStatus(503)
        res.sendStatus(503)
        return -1
    }
}

findBookAtUser = async (res, userid, bookid)=>{
    try{
       result = await UserModel.findOne({
            _id: mongoose.Types.ObjectId(userid),
            "bookshelf.bookId": mongoose.Types.ObjectId(bookid)
        },
        {"bookshelf":{$elemMatch: { bookId: mongoose.Types.ObjectId(bookid) } } }
        )
        .then((doc)=>{
            if(doc) return doc 
            else return -2
        })
        .catch((err)=>{if(err) {res.sendStatus(424); console.log("[X] [await catch deleteReview\]:\n====================\n"); return -1}})
        return result
    }catch(exception){
        res.sendStatus(503)
        return -1
    }
}

module.exports = {
    addBook, 
    removeBookFromShelf, 
    deleteReview,
    updateBookInfo,
    getBookInfoToDelete,
    addReviewToReviews,
    addReviewToBook,
    findBookAtUser
}

    // const user = await UserModel.aggregate(
    //     [{ $match: { _id: mongoose.Types.ObjectId(userId) } },
    //          {
    //         $project: {
    //             bookshelf: [{
    //                 $filter: {
    //                     input: '$bookshelf',
    //                     as: 'book',
    //                     cond: { $in: ["$$book.status", Status] },
    //                 }
    //             }], _id: 0
    //         }
    //     }, { $lookup: {from: 'books', pipline:[
    //         { $match: { _id: mongoose.Types._ObjectId(book.bookId) } },
            
    //     ] },as: 'bookInfo' }
    // // }, { $lookup: {from: 'books', localField: 'book.bookId', foreignField: '_id name description authorId avgRating', as: 'bookInfo'} }
    //     ], function (err, result) {
    //         if (err) {
    //             res.send(err);
    //         } else {
    //             if(!(result[0].length) > 0){
    //                 // console.log(result)
    //                 res.send(result[0].bookshelf[0])//.slice(Page * 3, Page * 3 + 3));
    //             }
    //             else
    //                 res.send(result)//.slice(Page * 3, Page * 3 + 3));
    //         }
    //     })
    // console.log(user[0].bookInfo)