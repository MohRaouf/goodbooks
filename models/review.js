// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

//creating reviews Schema 
const review_schema = new mongoose.Schema({

    bookId : {},
    userId : {},
    review_body : { type : String , required : true },
})

//creating review model 
const ReviewModel = mongoose.model('review', review_schema)
//exports review model
module.exports = ReviewModel
