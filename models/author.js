// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')
//creating author schema 
const authorSchema = new mongoose.Schema({

    fname : { type : String, minimumLength : 3, required : true },
    name : { type : String, minimumLength : 3, required : true },
    photo : { data : Buffer,  contentType : String },
    dob   : { type : Date, required : true },
    gender: { type : String , enum : ["Male","Female"], required : true },
    books : [{type: mongoose.Schema.Types.ObjectId, ref: 'book'}],
})

//creating author model
const AuthorModel = mongoose.model('author', authorSchema)
//exports author model 
module.exports = AuthorModel