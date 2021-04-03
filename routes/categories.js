const express = require('express')
const categoryRouter = express.Router()
const jwtHelpers = require('../helpers/jwt_helper')
const CategoryModel = require('../models/category')


/* Get All Categories no need for Authentication */
categoryRouter.get("/", async(req, res) => {
    const categories = await CategortModel.find({});
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

/* Get Categories by ID no need for Authentication */
categoryRouter.get('/:categoryid', async(req, res, next) => {
        const Id = req.params.categoryid;
        const category = await CategoryModel.find({_id:Id}).populate('books', 'name').populate('authors', 'fname');
        res.json(category)
    })
    
/* Insert new Categories need Authentication */
categoryRouter.post("/", jwtHelpers.verifyAccessToken, async(req, res) => {
    const categoryInfo = {
        name: req.body.name
    }
    await CategoryModel.create(categoryInfo).catch(err => {
        console.err(err);
        return res.status(500).send("Failed To Add New Category")
    }).then(category => {
        console.log(`Category ${category.name} Added Successfully`)
        return res.status(201).send("Created")
    })
})

/* Update Categories with ID need Authentication */
categoryRouter.patch("/:category_id", (req, res) => {

})

/* Delete Categories with ID need Authentication */
categoryRouter.delete("/:category_id", (req, res) => {

})

module.exports = categoryRouter