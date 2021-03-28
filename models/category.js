const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({

    name: { type: String, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})

const CategoryModel = mongoose.model('category', CategorySchema)
module.exports = CategoryModel