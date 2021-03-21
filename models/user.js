// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

//creating user Schema 
const userSchema = new mongoose.Schema({

    fname: { type: String, minimumLength: 3, required: true },
    lname: { type: String, minimumLength: 3, required: true },
    username: { type: String, minimumLength: 4, required: true, lowercase: true, trim: true },
    password: { type: String, minimumLength: 4, required: true, hide: true },
    email: { type: String, required: true, match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ },
    photo: { data: Buffer, contentType: String },
    gender: { type: String, enum: ["male", "female"], required: true }, //new field
    dob: { type: Date, required: true },
    bookshelf: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
        rate: { type: Number, min: 1, max: 5 }, //how?? : when user rate a book by default add the book as read and the rate to bookshelf 
        status: { enum: ["r", "c", "w"] },
        //readshelf: { }
    }],
    refreshToken: { type: "string", default: null }
})


userSchema.pre('save', function(next) {
    const doc = this;
    if (this.isNew) { //check if new doc
        bcrypt.hash(this.password, 10, (err, hashedText) => {
            console.log(`hashed Password : ${hashedText}`)
            doc.password = hashedText;
            next() //call next to execute the operation on the DB
        })
    }
})

//making a module to export it and using in validation in a middleware
const UserModel = mongoose.model('user', userSchema)
    //exporting user model to use it in routsh
module.exports = UserModel