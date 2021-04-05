const mongoose = require('mongoose')

const ReviewSchema = new mongoose.Schema({

    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    body: { type: String, required: true },
})

const ReviewModel = mongoose.model('review', ReviewSchema)
module.exports = ReviewModel