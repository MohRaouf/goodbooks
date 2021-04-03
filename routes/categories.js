const express = require('express')
const categoryRouter = express.Router()
const CategoryModel = require('../models/category')

/* get all categories*/
categoryRouter.get('/', async(req, res, next) => {
        const categories = await CategoryModel.find({});
        res.json(categories);
    })
    /* get popular categories */
    // >>> without querystring
categoryRouter.get('/top', async (req, res) => {
    try{
    const topCategories=await CategoryModel.getTopCategories(req.query.size);
    // console.log(topCategories);
    res.json(topCategories);
}
    catch(e){console.log(e.message)}
})
    /* get specific category */
categoryRouter.get('/:categoryid', async(req, res, next) => {
        const Id = req.params.categoryid;
        const category = await CategoryModel.find({_id:Id}).populate('books', 'name').populate('authors', 'fname');
        res.json(category)
    })
    
module.exports = categoryRouter