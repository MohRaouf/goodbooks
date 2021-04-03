const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    photo: { data: Buffer, contentType: String },
    description: { type: String, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'author', require: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', require: true },
    avgRating: { type: Number, default: 0 }, //calculated
    ratingCount: { type: Number, default: 0 }, //calculated
})

BookSchema.post('save', async function(doc) {
    console.log('In Book Save Middleware')

    await this.model('author').findByIdAndUpdate(doc.authorId, { $push: { books: doc } }).catch((err) => {
        console.error(err)
        return res.sendStatus(503)
    })
    await this.model('category').findByIdAndUpdate(doc.categoryId, { $push: { books: doc } }).catch((err) => {
        console.error(err)
        return res.sendStatus(503)
    })
});

const BookModel = mongoose.model('book', BookSchema)
module.exports = BookModel