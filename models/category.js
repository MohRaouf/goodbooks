const mongoose = require('mongoose')
const BookModel = require('./book')
const unknown = require('../config')

const UNKOWN_CATEGORY_ID = "6074790a318c453ac2776be9"
const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    photo: { type: String },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})

//static function to get popular categories
CategorySchema.statics.getTopCategories=function (){
// return this.find({"$expr": {"$gte": [{$size: "$books"}, parseInt(num)]}});
return this.find().sort({"books":-1}).limit(5)
}

CategorySchema.pre('remove', async() => {
    // Remove all the docs that refers
    await this.model('book').updateMany({ categoryId: this._id }, { categoryId: UNKOWN_CATEGORY_ID })
        .then(() => next())
        .catch((err) => { next(err) })
});

CategorySchema.pre('deleteOne', { document: false, query: true }, async function(next) {
    console.log('==================> In Category pre middle ware')
    const delCategoryId = this.getFilter()["_id"];
    console.log('delCategoryId', delCategoryId)
    await BookModel.updateOne({ categoryId: delCategoryId }, { categoryId: UNKOWN_CATEGORY_ID })
        .catch((err) => next(err)).then(next())
});

const CategoryModel = mongoose.model('category', CategorySchema)
module.exports = CategoryModel