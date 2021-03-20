// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

//creating user Schema 
const userSchema = new mongoose.Schema({

    fname:    { type : String, minimumLength : 3, required : true },
    lname:    { type : String, minimumLength : 3, required : true },
    username :{ type : String, minimumLength : 6, required : true, lowercase: true, trim: true },
    password: { type : String, minimumLength : 8, required : true, hide : true},
    email:    { type : String, required : true, match : /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ },
    photo :   { data : Buffer, contentType : String },
    gender: { type : String , enum : ["Male","Female"], required : true }, //new field
    bookshelf: [{ 
        bookId   : { type: mongoose.Schema.Types.ObjectId , ref : 'book' },
        rate     : { type : Number, min : 1, max : 5 }, //how?? : when user rate a book by default add the book as read and the rate to bookshelf 
        status   : { enum : ["r","c","w"] },
        //readshelf: { }
    }],
})

//making a module to export it and using in validation in a middleware
const UserModel = mongoose.model('user',userSchema)
//exporting user model to use it in routsh
module.exports= UserModel