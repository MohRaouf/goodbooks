// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')

//creating category Schema 
const categorySchema = new mongoose.Schema({

    name  : { type : String, required : true },
    books : [{type: mongoose.Schema.Types.ObjectId, ref: 'book'}],
})

//static function to get popular categories
categorySchema.statics.getTopCategories=function (num){
return this.find({"$expr": {"$gte": [{$size: "$books"}, parseInt(num)]}});
}

const CategoryModel = mongoose.model('category',categorySchema)
//exporting 
module.exports = CategoryModel