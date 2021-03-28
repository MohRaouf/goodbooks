const express = require('express')
const categoryRouter = express.Router()
const CategortModel = require('../models/category')

/* get all categories*/
categoryRouter.get('/', async(req, res, next) => {
        const categories = await CategortModel.find({});
        res.json(categories);
    })
    /* get specific category */
categoryRouter.get('/:categoryid', async(req, res, next) => {
        const Id = req.params.categoryid;
        const category = await CategortModel.find({_id:Id}).populate('books', 'name').populate('authors', 'fname');
        res.json(category)
    })
    /* get popular categories */
categoryRouter.get('/top/:number', async (req, res) => {
    const topCategories=await CategortModel.getTopCategories(req.params.number);
        res.json(topCategories);
})
module.exports = categoryRouter