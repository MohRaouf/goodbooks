// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    //_id Auto increment [not finshed = > seaarch ]
<<<<<<< HEAD
    name  : { type : String, required : true },
    photo : { data : Buffer,  contentType : String },
    description : { type : String, required : true, },
    reviews : [ {type: mongoose.Schema.Types.ObjectId, ref: 'review'},],
    autherId :  {type: mongoose.Schema.Types.ObjectId, ref: 'author'},
    categoryId :  [{type: mongoose.Schema.Types.ObjectId, ref: 'category'}],
    avgRating : {}, //calculated
    ratingCount : {}, //calculated
||||||| aa0cfc6
    book_name  : { type : String, required : true },
    book_photo : { data : Buffer,  contentType : String },
    book_description : { type : String, required : true, },
    book_reviews : [{}],
    book_autherId : {},
    book_categoryId : {},
    book_avgRating : {},
    book_ratingCount : {},
=======
    name: { type: String, required: true, index: true },
    photo: { data: Buffer, contentType: String },
    description: { type: String, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'author', require: true },
    categoryId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'category', require: true }],
    avgRating: {}, //calculated
    ratingCount: {}, //calculated
>>>>>>> e4b8ccb582cc2a44c2be44a6ccf15685b1040ab8
})

//creating book model to use it in validation with a middleware
const BookModel = mongoose.model('book', bookSchema)

//exporting the book model 
module.export = BookModel