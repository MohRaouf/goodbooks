const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({

    name: { type: String, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})

const CategoryModel = mongoose.model('category', categorySchema)
module.exports = CategoryModel