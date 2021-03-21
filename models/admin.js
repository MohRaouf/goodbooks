const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema({
    username: { type: String, unique: true, minLength: 3, required: true },
    password: { type: "string", required: true },
    refreshToken: { type: "string", default: null },
})

adminSchema.pre('save', function(next) {
    const doc = this;
    if (this.isNew) { //check if new doc
        bcrypt.hash(this.password, 10, (err, hashedText) => {
            doc.password = hashedText;
            next() //call next to execute the operation on the DB
        })
    }
})
const adminModel = mongoose.model("admin", adminSchema);
module.exports = adminModel;