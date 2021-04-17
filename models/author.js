const mongoose = require('mongoose')

const BookModel = require('./book')
const unknown = require('../config')
const UNKNOWN_AUTHOR_ID = "60747906318c453ac2776be8"

const AuthorSchema = new mongoose.Schema({

    fname: { type: String, minimumLength: 2, required: true },
    lname: { type: String, minimumLength: 2, default:""},
    photo: { type: String },
    dob: { type: Date },
    gender: { type: String, enum: ["m", "f"] },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})
AuthorSchema.index({ fname: 1, lname: 1 }, { unique: true });

AuthorSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    console.log('==================> In Author pre middle ware')
    const delAuthorId = this.getFilter()["_id"];
    console.log('delAuthorId', delAuthorId)
    await BookModel.updateMany({ authorId: delAuthorId }, { authorId: UNKNOWN_AUTHOR_ID })
        .catch((err) => next(err)).then(next())
});

//static function to get popular authors
AuthorSchema.statics.getTopAuthors=function(num){
    // return this.find({"$expr": {"$gte": [{$size: "$books"}, parseInt(num)]}});
    return this.find().sort({"books":-1}).limit(5);
 }
//exports author model 
const AuthorModel = mongoose.model('author', AuthorSchema)
module.exports = AuthorModel
