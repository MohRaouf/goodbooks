// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

//creating category Schema 
const category_schema = new mongoose.Schema({

    category_name  : { type : String, required : true },
    category_books : [{type: mongoose.Schema.Types.ObjectId, ref: 'book'}],
})

//
const CategoryModel = mongoose.model('category',category_schema)
//exporting 
module.exports = CategoryModel