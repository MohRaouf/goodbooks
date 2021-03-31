const mongoose = require('mongoose')
const UNKNOWN_AUTHOR_ID = "605a7532a7e0791351374d8c"

const BookModel = require('./book')

const AuthorSchema = new mongoose.Schema({

    fname: { type: String, minimumLength: 2, required: true },
    lname: { type: String, minimumLength: 2 },
    photo: { data: Buffer, contentType: String },
    dob: { type: Date },
    gender: { type: String, enum: ["m", "f"] },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})
AuthorSchema.index({ fname: 1, lname: 1 }, { unique: true });

AuthorSchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    console.log('==================> In Author pre middle ware')
    const delAuthorId = this.getFilter()["_id"];
    console.log('delAuthorId', delAuthorId)
    await BookModel.updateOne({ authorId: delAuthorId }, { authorId: UNKNOWN_AUTHOR_ID })
        .catch((err) => next(err)).then(next())
});

const AuthorModel = mongoose.model('author', AuthorSchema)
module.exports = AuthorModel