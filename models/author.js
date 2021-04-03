const mongoose = require('mongoose')
const AuthorSchema = new mongoose.Schema({

    fname: { type: String, minimumLength: 2, required: true },
    lname: { type: String, minimumLength: 2 },
    photo: { data: Buffer, contentType: String },
    dob: { type: Date },
    gender: { type: String, enum: ["male", "female"] },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})

//static function to get popular authors
AuthorSchema.statics.getTopAuthors=function(num){
    return this.find({"$expr": {"$gte": [{$size: "$books"}, parseInt(num)]}});
 }
//exports author model 
const AuthorModel = mongoose.model('author', AuthorSchema)
module.exports = AuthorModel