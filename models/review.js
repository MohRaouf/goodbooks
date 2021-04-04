// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

//creating reviews Schema 
const reviewSchema = new mongoose.Schema({
    bookId : { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
    userId : { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    body   : { type : String , required : true },
})

//creating review model 
const ReviewModel = mongoose.model('review', reviewSchema)
//exports review model
module.exports = ReviewModel
