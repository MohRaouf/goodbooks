const express = require('express');
const AuthorModel = require('../models/author')
const jwtHelpers = require('../helpers/jwt_helper')
const authorRouter = express.Router();

/* Get All Authors no need for Authentication */
authorRouter.get("/", async (req, res) => {
    const page = req.query.page
    const perPage = req.query.perPage
    try {
        const countAuthors = await AuthorModel.countDocuments({})
        const allAuthors = await AuthorModel.find().skip(parseInt(perPage) * parseInt(page - 1)).limit(parseInt(perPage))
        if (allAuthors) return res.json({ allAuthors, countAuthors });
        return res.status(404).end();
    } catch (err) {
        return res.status(500).end()
    }

})
//when request to get popular author
// >>> with query
authorRouter.get("/top", async (req, res) => {
    AuthorModel.getTopAuthors()
        .then((topAuthors) => {
            if (topAuthors) { return res.json(topAuthors) }
            else { return res.status(404).end() }
        }).catch((err) => { return res.status(500).end() })
})

/* Get Author by ID no need for Authentication */
authorRouter.get("/:author_id", (req, res) => {
    const id = req.params.author_id;
    AuthorModel.findById(id).populate({ path: 'books', select: '_id name photo' })
        .then((author) => {
            if (author) return res.json(author);
            return res.status(404).end()
        }).catch((err) => {
            return res.status(500).end()
        })
})

/* Insert new Author need Authentication */
authorRouter.post("/", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, (req, res) => {
    const authorInfo = {
        fname: req.body.fname,
        lname: req.body.lname, //optional
        ...(req.body.photo ? { photo: req.body.photo } : {}), //optional
        ...(req.body.dob ? { dob: req.body.dob } : {}), //optional
        ...(req.body.gender ? { gender: req.body.gender } : {}), //optional
    }
    AuthorModel.create(authorInfo).then((author) => {
        return res.status(201).end()
    }).catch((err) => { return res.status(500).end() })
})

/* Update Author with ID need Authentication */
authorRouter.patch("/:author_id", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, (req, res) => {
    const id = req.params.author_id;
    const newAuthorInfo = {
        ...(req.body.fname ? { fname: req.body.fname } : {}),
        ...(req.body.lname ? { lname: req.body.lname } : {}),
        ...(req.body.photo ? { photo: req.body.photo } : {}),
        ...(req.body.dob ? { dob: req.body.dob } : {}),
        ...(req.body.gender ? { gender: req.body.gender } : {}),
    }
    AuthorModel.findByIdAndUpdate({ _id: id }, newAuthorInfo, { new: true, useFindAndModify: false })
        .then((updatedDoc) => {
            if (updatedDoc) return res.status(202).end()
            return res.status(404).end()
        }).catch((err) => { return res.status(400).end() })
})

/* Delete Author with ID need Authentication */
authorRouter.delete("/:author_id", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, (req, res) => {
    const id = req.params.author_id;
    AuthorModel.deleteOne({ _id: id }, { new: true, useFindAndModify: false })
        .then((deletedDoc) => {
            if (deletedDoc) return res.status(200).end()
            return res.status(404).end()
        }).catch((err) => { return res.status(500).end() })

})

authorRouter.get("/search/:q", async (req, res) => {
    const searchWord = req.params.q
    console.log(searchWord)
    const filterResult = await AuthorModel.find({
        $or: [
            { fname: { $regex: searchWord, $options: '$i' } },
            { lname: { $regex: searchWord, $options: '$i' } }
        ]
    })
        //{fname:{$regex:searchWord,$options:'$i'}}
        .catch((err) => {
            console.error(err)
            return res.status(500).send("Internal server error")
        })
    //console.log(filterResult)
    return res.json(filterResult);
})
module.exports = authorRouter;