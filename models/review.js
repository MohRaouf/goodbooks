const mongoose = require('mongoose')

<<<<<<< HEAD
//creating reviews Schema 
const reviewSchema = new mongoose.Schema({
    bookId : { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    body   : { type : String , required : true },
||||||| e4b8ccb
//creating reviews Schema 
const reviewSchema = new mongoose.Schema({

    bookId : { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    body   : { type : String , required : true },
=======
const ReviewSchema = new mongoose.Schema({

    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    body: { type: String, required: true },
>>>>>>> fe40f1355790bb9c3b0e1b1656c624a515a22490
})

const ReviewModel = mongoose.model('review', ReviewSchema)
module.exports = ReviewModel