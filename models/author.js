// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')
//creating auther schema 
const auther_schema = new mongoose.Schema({

    fname : { type : String, minimumLength : 3, required : true },
    lname : { type : String, minimumLength : 3, required : true },
    photo : { data : Buffer,  contentType : String },
    dob   : { type : Date, required : true },
    gender: { type : String , enum : ["M", "F"]},
    books : [{type: mongoose.Schema.Types.ObjectId, ref: 'book'}]
})

//creating Auther model
const AutherModel = mongoose.model('auther', auther_schema)
//exports Auther model 
module.exports = AutherModel