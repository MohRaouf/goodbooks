const express = require('express')
const bookRouter = express.Router()
const BookModel = require('../models/book')
const jwtHelpers = require('../helpers/jwt_helper')


/* Get All Books no need for Authentication */
bookRouter.get("/", async(req, res) => {
    const books = await BookModel.find({}).populate('author', 'name');
    res.json(books)
})

/* Get Book by ID no need for Authentication */
bookRouter.get("/:book_id", async(req, res) => {
    const Id = req.params.bookid;
    const book = await BookModel.findbyId(Id).populate('authors', 'fname').populate('categories', 'name');
    res.json(book);
})

/* Insert new Book need Authentication */
bookRouter.post("/", jwtHelpers.verifyAccessToken, async(req, res) => {
    const bookInfo = {
        name: req.body.name,
        ...(req.body.photo ? { photo: req.body.photo } : {}), //optional
        description: req.body.description,
        authorId: req.body.authorId,
        categoryId: req.body.categoryId
    }
    await BookModel.create(bookInfo).catch(err => {
        console.err(err);
        return res.status(500).send("Failed To Add New Book")
    }).then(book => {
        console.log(`Book ${bookInfo.name} Added Successfully`)
        return res.status(201).send("Created")

    })
})

/* Update Book with ID need Authentication */
bookRouter.patch("/:book_id", async(req, res) => {

})

/* Delete Book with ID need Authentication */
bookRouter.delete("/:book_id", async(req, res) => {

})

/* Get Popular Books */
bookRouter.get("/top", async(req, res) => {
    const topbooks = await BookModel.find({ avgRating: { $gt: 4 } })
})

module.exports = bookRouter