const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const AdminSchema = new mongoose.Schema({
    username: { type: String, unique: true, minLength: 3, required: true },
    password: { type: "string", required: true },
    refreshToken: { type: "string", default: null },
})

AdminSchema.pre('save', function (next) {
    const doc = this;
    if (this.isNew) { //check if new doc
        bcrypt.hash(this.password, 10, (err, hashedText) => {
            if (err) console.error(err)
            doc.password = hashedText;
            next()
        })
    }
})

AdminSchema.methods.isValidPassword = async function (password) {
    try {
        const result = await bcrypt.compare(password, this.password)
        return result
    } catch (err) {
        console.error(err)
        return false
    }
}

const AdminModel = mongoose.model("admin", AdminSchema);
module.exports = AdminModel;