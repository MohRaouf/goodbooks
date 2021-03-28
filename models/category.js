// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

//creating category Schema 
const categorySchema = new mongoose.Schema({

    name  : { type : String, required : true },
    books : [{type: mongoose.Schema.Types.ObjectId, ref: 'book'}],
})

//static function to get popular categories
// categorySchema.statics.getTopCategories=function (size,cb){
//    return this.find({ books: { $size: { $gt: size } } });
// }
categorySchema.statics.getTopCategories=function (size){
    return this.find({ books: { $size: { $gt: size } } });
 }
//
const CategoryModel = mongoose.model('category',categorySchema)
//exporting 
module.exports = CategoryModel