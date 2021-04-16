const express = require('express');
const AuthorModel = require('../models/author')
const jwtHelpers = require('../helpers/jwt_helper')
const authorRouter = express.Router();

/* Get All Authors no need for Authentication */
authorRouter.get("/", (req, res) => {
    AuthorModel.find().then((allAuthors) => {
        if (allAuthors) { return res.json(allAuthors) }
        else { return res.status(404).end() }
    }).catch((err) => { return res.status(400).end() })
})
//when request to get popular author
// >>> with query
authorRouter.get("/top", async (req, res) => {
    AuthorModel.getTopAuthors(1)
        .then((topAuthors) => {
            if (topAuthors) { return res.json(topAuthors) }
            else { return res.status(404).end() }
        })
        .catch((err) => { return res.status(500).end() })
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
module.exports = authorRouter;