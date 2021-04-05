const express = require('express')
const bookRouter = express.Router()
const BookModel = require('../models/book')
const jwtHelpers = require('../helpers/jwt_helper')

/* get all books */
bookRouter.get('/', async(req, res, next) => {
        const books = await BookModel.find({}).populate('author', 'name')
        .catch((err)=>{
            return res.status(500).send("Internal Server Error")
        })
        return res.json(books)
    })

bookRouter.get('/top', async(req, res) => { 
        // const topBooks= await BookModel.getTopBooks(req.query.size)
        const topBooks= await BookModel.getTopBooks(4)
        .catch((err)=>{return res.status(500).send("Internal Server Error")})
        if(topBooks){return res.json(topBooks);}
        else {return res.status(404).send("Not Found")}
})    
/* get specific book info */
bookRouter.get('/:bookid', async(req, res, next) => {
        const Id = req.params.bookid;
        const book = await BookModel.find({_id:Id}).populate('authors', 'fname').populate('categories', 'name')
        .catch((err)=>{return res.status(500).send('Internal server error')})
        if(book){return res.json(book)}
        else {return res.status(404).send("Not Found")}
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

module.exports = bookRouter