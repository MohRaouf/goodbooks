const express = require('express')
const categoryRouter = express.Router()
const jwtHelpers = require('../helpers/jwt_helper')
const CategoryModel = require('../models/category')

/* Get All Categories no need for Authentication */
categoryRouter.get("/", async(req, res) => {
    const allCategories = await CategoryModel.find()
        .catch((err) => {
            console.error(err)
            return res.status(400).send("Bad Request")
        })
    console.log("All Categories : ", allCategories)
    return res.json(allCategories);
})

/* Get Categories by ID no need for Authentication */
categoryRouter.get("/:category_id", async(req, res) => {
    const id = req.params.category_id;
    console.log(id)
    const catrgory = await CategoryModel.findById(id).populate('book').exec()
        .catch((err) => {
            console.log(err)
            return res.status(500).send('Internal server error')
        })
    if (catrgory) {
        console.log(catrgory)
        return res.json(catrgory);
    }
    console.log('Not Found')
    return res.status(404).send("Not Found")
})

/* Insert new Categories need Authentication */
categoryRouter.post("/", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {
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
categoryRouter.patch("/:category_id", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {

    const id = req.params.category_id;
    console.log(`Updating Category ID : ${id}`)

    const newCategoryInfo = {
        ...(req.body.fname ? { fname: req.body.fname } : {}),
        ...(req.body.lname ? { lname: req.body.lname } : {}),
        ...(req.body.photo ? { photo: req.body.photo } : {}),
        ...(req.body.dob ? { dob: req.body.dob } : {}),
        ...(req.body.gender ? { gender: req.body.gender } : {}),
    }
    console.log(`Updated Info : ${newCategoryInfo}`)
    const updatedDoc = await CategoryModel.findByIdAndUpdate({ _id: id }, newCategoryInfo, { new: true, useFindAndModify: false }).
    catch((err) => {
        console.error("====Error===>", err)
        return res.status(400).send("Bad Request")
    })
    if (updatedDoc) {
        console.log(`Updated Info : ${updatedDoc}`)
        return res.status(202).send("Accepted")
    }
    console.log(`Updated Info : ${updatedDoc}`)
    return res.status(404).send("category not found")

})

/* Delete Categories with ID need Authentication */
categoryRouter.delete("/:category_id", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {

    const id = req.params.category_id;
    const docToDelete = await CategoryModel.deleteOne({ _id: id }, { new: true, useFindAndModify: false })
        .catch((err) => {
            console.error(err)
            return res.status(500).send("Internal server error")
        })
    if (docToDelete) {
        console.log(`Category ID : ${id} Deleted`)
        return res.status(200).send("Deleted")
    }
    console.log(`Book Not Found`)
    return res.status(404).send("Book not found")

})

/* Get Popular Categories */
// categoryRouter.get("/top", async(req, res) => {
//     const topCategories = await CategortModel.find({ books: { $size: { $gt: 10 } } });
//     res.json(topCategories);
// })

module.exports = categoryRouter