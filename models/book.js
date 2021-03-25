const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    //_id Auto increment [not finshed = > seaarch ]
    name: { type: String, required: true, index: true },
    photo: { data: Buffer, contentType: String },
    description: { type: String, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'author', require: true },
    categoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category', require: true }],
    avgRating: { type: Number }, //calculated
    ratingCount: { type: Number }, //calculated
})
bookSchema.post('save', function(doc) {
    AuthorModel.findByIdAndUpdate(doc.authorId,{$push:{books:doc}},(err,user)=>{
        console.log("Yesss")
    })
        CategoryModel.updateMany({_id: { "$in": doc.categoryId }},{$push:{books:doc}},(err,user)=>{
            console.log("Yesss")
        })
      
    });
const BookModel = mongoose.model('book', bookSchema)
module.exports = BookModel