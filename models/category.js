const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({

    name: { type: String, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})

//static function to get popular categories
CategorySchema.statics.getTopCategories=function (num){
return this.find({"$expr": {"$gte": [{$size: "$books"}, parseInt(num)]}});
}

//exporting 
const CategoryModel = mongoose.model('category', CategorySchema)
module.exports = CategoryModel