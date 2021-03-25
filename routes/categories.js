const express = require('express')
const categoryRouter = express.Router()
const jwtHelpers = require('../helpers/jwt_helper')
const CategoryModel = require('../models/category')

/* Get All Categories no need for Authentication */
categoryRouter.get("/", async(req, res) => {
    const categories = await CategortModel.find({});
    res.json(categories);
})

/* Get Categories by ID no need for Authentication */
categoryRouter.get("/:category_id", async(req, res) => {
    const Id = req.params.categoryid;
    const category = await categoryRouter.findbyId(Id).populate('books', 'name').populate('authors', 'fname');
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

/* Get Popular Categories */
categoryRouter.get("/top", async(req, res) => {
    const topCategories = await CategortModel.find({ books: { $size: { $gt: 10 } } });
    res.json(topCategories);
})

module.exports = categoryRouter