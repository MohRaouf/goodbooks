const express = require('express')
const categoryRouter = express.Router()
const jwtHelpers = require('../helpers/jwt_helper')
const CategoryModel = require('../models/category')

/* Get All Categories no need for Authentication */

categoryRouter.get("/", async (req, res) => {
    const page = req.query.page
    const perPage = req.query.perPage
    try {
        const countCategories = await CategoryModel.countDocuments({})
        const allCategories = await CategoryModel.find().skip(parseInt(perPage) * parseInt(page - 1)).limit(parseInt(perPage))
        if (allCategories) return res.json({ allCategories, countCategories });
        return res.status(404).end()
    } catch (err) { return res.status(500).end() }
})

/* get popular categories */
// >>> without querystring
categoryRouter.get('/top', (req, res) => {
    CategoryModel.getTopCategories(4)
        .then((topCategories) => {
            if (topCategories) return res.json(topCategories)
            return res.status(404).end()
        }).catch((err) => {
            return res.status(500).end()
        })
})

/* Get Categories by ID no need for Authentication */
categoryRouter.get('/:categoryid', (req, res, next) => {
    const Id = req.params.categoryid;
    CategoryModel.find({ _id: Id })
        .populate({ path: 'books', select: '_id name photo', populate: { path: 'authorId', select: '_id fname lname' } })
        .then((category) => {
            if (category) { return res.json(category) }
            return res.status(404).end()
        })
        .catch((err) => { return res.status(500).send("Internal Server Error") })
})

/* Insert new Categories need Authentication */
categoryRouter.post("/", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, (req, res) => {
    const categoryInfo = {
        name: req.body.name,
        photo: req.body.photo
    }
    CategoryModel.create(categoryInfo)
        .then(category => {
            if (category) { return res.status(201).end() }
            return res.status(500).end()
        }).catch(err => {
            console.err(err);
            return res.status(500).end()
        })
})

/* Update Categories with ID need Authentication */
categoryRouter.patch("/:category_id", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, async (req, res) => {
    const id = req.params.category_id;
    const newCategoryInfo = {
        name: req.body.name,
        ...(req.body.photo ? { photo: req.body.photo } : {}),
    }
    try {
        const updatedDoc = await CategoryModel.findByIdAndUpdate({ _id: id }, newCategoryInfo, { new: true, useFindAndModify: false })
        if (updatedDoc) {
            return res.status(202).end()
        }
        return res.status(404).end()
    } catch (err) {
        console.error("====Error===>", err)
        return res.status(400).end()
    }
})

/* Delete Categories with ID need Authentication */
categoryRouter.delete("/:category_id", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, (req, res) => {
    const id = req.params.category_id;
    CategoryModel.deleteOne({ _id: id }, { new: true, useFindAndModify: false })
        .then((docToDelete) => {
            if (docToDelete) { return res.status(200).end() }
            return res.status(404).end()
        }).catch((err) => { return res.status(500).end() })
})
categoryRouter.get("/search/:q", async (req, res) => {
    const searchWord = req.params.q
    console.log(searchWord)
    const filterResult = await CategoryModel.find({ name: { $regex: searchWord, $options: '$i' } })
        //{fname:{$regex:searchWord,$options:'$i'}}
        .catch((err) => {
            console.error(err)
            return res.status(500).send("Internal server error")
        })
    //console.log(filterResult)
    return res.json(filterResult);
})
module.exports = categoryRouter