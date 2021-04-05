const mongoose = require('mongoose')
const BookModel = require('./book')

const UNKOWN_CATEGORY_ID = "605a7694b4114213c53d8711"

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'book' }],
})

//static function to get popular categories
CategorySchema.statics.getTopCategories=function (num){
return this.find({"$expr": {"$gte": [{$size: "$books"}, parseInt(num)]}});
}


CategorySchema.pre('remove', async() => {
    // Remove all the docs that refers
    await this.model('book').updateOne({ categoryId: this._id }, { categoryId: UNKOWN_CATEGORY_ID })
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