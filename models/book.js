const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    name: { type: String, required: true, index: true },
    photo: {type:String},
    description: { type: String, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'author', require: true,default:"606c0efd4ec9b9134cb14df7" },

    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', require: true,default:"606c0f1c4ec9b9134cb14df8" },
    avgRating: { type: Number, default: 0 }, //calculated
    ratingCount: { type: Number, default: 0 }, //calculated
})

BookSchema.statics.getTopBooks=function (rate){
    return this.find({"$expr": {"$gte": [{$size: "$reviews"}, 20]}},{ "avgRating" : {$gt :parseInt(rate)}},);
  }


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
