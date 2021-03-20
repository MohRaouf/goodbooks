// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

//creating user Schema 
const user_schema = new mongoose.Schema({

    user_fname:    { type : String, minimumLength : 3, required : true },
    user_lname:    { type : String, minimumLength : 3, required : true },
    user_username :{ type : String, minimumLength : 6, required : true },
    user_password: { type : String, minimumLength : 8, required : true, hide : true},
    user_email:    { type : String, required : true, match : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ },
    user_photo :   { data : Buffer, contentType : String },
    user_gender: { type : String , enum : ["Male","Female"], required : true }, //new field
    user_bookshelf: [{}],
})

//making a module to export it and using in validation in a middleware
const UserModel = mongoose.model('user',user_schema)
//exporting user model to use it in routsh
module.exports= UserModel