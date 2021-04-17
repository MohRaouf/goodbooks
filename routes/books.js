const express = require('express')
const bookRouter = express.Router()
const jwtHelpers = require('../helpers/jwt_helper')
const BookModel = require('../models/book')

/* Get All Books no need for Authentication */
bookRouter.get("/", async (req, res) => {
    const page = req.query.page
    const perPage = req.query.perPage
    try {
        const countBooks = await BookModel.countDocuments({})
        const allBooks = await BookModel.find().select("_id name description authorId categoryId photo avgRating").
            skip(parseInt(perPage) * parseInt(page - 1)).limit(parseInt(perPage))
            .populate({ path: 'authorId', select: '_id fname lname' })
            .populate({ path: 'categoryId', select: '_id   name' })
        if (allBooks) return res.json({ allBooks, countBooks });
        return res.status(404).end()
    } catch (err) { return res.status(500).end() }
})

bookRouter.get('/top', (req, res) => {
    // const topBooks= await BookModel.getTopBooks(req.query.size)
    BookModel.getTopBooks()
        .then((tops) => {
            if (tops) return res.json(tops);
            else return res.status(404).end()
        }).catch((err) => { return res.status(500).end() })
})
/* Get Book by ID no need for Authentication */
bookRouter.get("/:book_id", (req, res) => {
    const id = req.params.book_id;
    BookModel.findById(id).populate({ path: 'authorId', select: '_id fname lname' })
        .populate({ path: 'categoryId', select: '_id   name' })
        .populate({ path: 'reviews', select: 'body', populate: { path: "userId", seclect: '_id fname lname' } })
        .then((book) => {
            if (book) return res.json(book);
            return res.status(404).end()
        })
        .catch((err) => { return res.status(500).end() })
})
/* Insert new Book need Authentication */
bookRouter.post("/", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, async (req, res) => {
    const bookInfo = {
        name: req.body.name,
        ...(req.body.photo ? { photo: req.body.photo } : {}), //optional
        description: req.body.description,
        ...(req.body.authorId ? { authorId: req.body.authorId } : {}), //optional
        ...(req.body.categoryId ? { categoryId: req.body.categoryId } : {}), //optional
    }
    try {
        await BookModel.create(bookInfo)
        return res.status(201).end()
    } catch (err) {
        console.error(err);
        return res.status(500).end()
    }
})

/* Update Book with ID need Authentication */
bookRouter.patch("/:book_id", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, async (req, res) => {
    const id = req.params.book_id;
    const newBookInfo = {
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.photo ? { photo: req.body.photo } : {}),
        ...(req.body.description ? { description: req.body.description } : {}),
        ...(req.body.categoryId ? { categoryId: req.body.categoryId } : {}),
        ...(req.body.authorId ? { authorId: req.body.authorId } : {}),
    }
    try {
        const updatedDoc = await BookModel.findByIdAndUpdate({ _id: id }, newBookInfo, { new: true, useFindAndModify: false })
        if (updatedDoc) return res.status(202).end()
        return res.status(404)
    } catch (err) {
        console.error("====Error===>", err)
        return res.status(400).end()
    }
})
/* Delete Book with ID need Authentication */
bookRouter.delete("/:book_id", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, (req, res) => {
    const id = req.params.book_id;
    BookModel.findByIdAndDelete(id)
        .then((deletedDoc) => {
            if (deletedDoc) return res.status(200).end()
            return res.status(404).end()
        }).catch((err) => { return res.status(500).end() })

})
bookRouter.get("/search/:q", (req, res) => {
    const searchWord = req.params.q;
    console.log(searchWord)
    BookModel.find({ name: { $regex: searchWord, $options: '$i' } }).select("_id name description authorId categoryId photo avgRating")
    .populate({ path: 'authorId', select: '_id fname lname' })
    .populate({ path: 'categoryId', select: '_id   name' })
        .catch((err) => {
            console.error(err)
            return res.status(500).send("Internal server error")
        }).then((filterResult) => {
            return res.json(filterResult);
        })
})
module.exports = bookRouter