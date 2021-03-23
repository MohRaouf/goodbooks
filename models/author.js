// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')
//creating auther schema 
const AuthorSchema = new mongoose.Schema({

    fname : { type : String, minimumLength : 3, required : true },
    lname : { type : String, minimumLength : 3, required : true },
    photo : { data : Buffer,  contentType : String },
    dob   : { type : Date, required : true },
    gender: { type : String , enum : ["M", "F"]},
    books : [{type: mongoose.Schema.Types.ObjectId, ref: 'book'}]
})

//creating Auther model
const AuthorModel = mongoose.model('auther', AuthorSchema)
//exports Auther model 
module.exports = AuthorModel