const mongoose = require('mongoose')
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({

    fname: { type: String, minimumLength: 3, required: true },
    lname: { type: String, minimumLength: 3, required: true },
    username: { type: String, minimumLength: 4, required: true, lowercase: true, trim: true, unique: true },
    password: { type: String, minimumLength: 4, required: true },
    email: { type: String, required: true, match: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/ },
    photo: { data: Buffer, contentType: String },
    gender: { type: String, enum: ["m", "f"], required: true }, //new field
    dob: { type: Date, required: true },
    bookshelf: [{
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'book' },
        rate: { type: Number, min: 0, max: 5, default: 0 }, //how?? : when user rate a book by default add the book as read and the rate to bookshelf 
        status: { type: String, enum: ["r", "c", "w"], default: "r" },
        //readshelf: { }
    }],
    refreshToken: { type: "string", default: null }
})


UserSchema.pre('save', function(next) {
    const doc = this;
    if (this.isNew) { //check if new doc
        bcrypt.hash(this.password, 10, (err, hashedText) => {
            if(err) console.error(err)
            doc.password = hashedText;
            next()
        })
    }
})

UserSchema.methods.isValidPassword = async function(password) {
    try {
        const result = await bcrypt.compare(password, this.password)
        return result
    } catch (err) {
        console.error(err)
        return false
    }
}

const UserModel = mongoose.model('user', UserSchema)
module.exports = UserModel