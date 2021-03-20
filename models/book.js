// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

const books_schema = new mongoose.Schema({
    //_id Auto increment [not finshed = > seaarch ]
    book_name  : { type : String, required : true },
    book_photo : { data : Buffer,  contentType : String },
    book_description : { type : String, required : true, },
    book_reviews : [{}],
    book_autherId : {},
    book_categoryId : {},
    book_avgRating : {},
    book_ratingCount : {},
})

//creating book model to use it in validation with a middleware
const BookModel = mongoose.model('book',books_schema)

//exporting the book model 
module.export = BookModel

