const mongoose = require('mongoose')

const BookSchema = new mongoose.Schema({
    //_id Auto increment [not finshed = > seaarch ]
    name: { type: String, required: true, index: true },
    photo: { data: Buffer, contentType: String },
    description: { type: String, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'author', require: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'category', require: true },
    avgRating: { type: Number }, //calculated
    ratingCount: { type: Number }, //calculated
})
BookSchema.post('save', async function(doc) {
    AuthorModel.findByIdAndUpdate(doc.authorId,{$push:{books:doc}}).catch((err) => {
        console.error(err)
        return res.sendStatus(503)
    })
    CategoryModel.findByIdAndUpdate(doc.authorId,{$push:{books:doc}}).catch((err) => {
        console.error(err)
        return res.sendStatus(503)
    })
      
    });
const BookModel = mongoose.model('book', BookSchema)
module.exports = BookModel