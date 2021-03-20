// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    //_id Auto increment [not finshed = > seaarch ]
    name  : { type : String, required : true, index : true },
    photo : { data : Buffer,  contentType : String },
    description : { type : String, required : true, },
    reviews    : [{ type: mongoose.Schema.Types.ObjectId, ref: 'review'},],
    authorId   : {  type: mongoose.Schema.Types.ObjectId, ref: 'author'},
    categoryId : [{ type: mongoose.Schema.Types.ObjectId, ref: 'category'}],
    avgRating  : {}, //calculated
    ratingCount: {}, //calculated
})

//creating book model to use it in validation with a middleware
const BookModel = mongoose.model('book',bookSchema)

//exporting the book model 
module.export = BookModel

