const mongoose = require('mongoose')
const authorSchema = new mongoose.Schema({

    fname: { type: String, minimumLength: 2, required: true },
    lname: { type: String, minimumLength: 2 },
    photo: { data: Buffer, contentType: String },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})

const AuthorModel = mongoose.model('author', authorSchema)
module.exports = AuthorModel