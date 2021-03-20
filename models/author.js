// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')
//creating auther schema 
const auther_schema = new mongoose.Schema({

    auther_fname : { type : String, minimumLength : 3, required : true },
    auther_lname : { type : String, minimumLength : 3, required : true },
    auther_photo : { data : Buffer,  contentType : String },
    auther_dob   : { type : Date, required : true },
    auther_gender: { type : String , enum : ["Male","Female"], required : true },
    auther_books : [{  }]
})

//creating Auther model
const AutherModel = mongoose.model('auther', auther_schema)
//exports Auther model 
module.exports = AutherModel