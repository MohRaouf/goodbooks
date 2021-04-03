const express = require('express')
const bookRouter = express.Router()
const BookModel = require('../models/book')

/* get all books */
bookRouter.get('/', async(req, res, next) => {
        const books = await BookModel.find({}).populate('author', 'name');
        res.json(books)
    })
 /* get popular books */
bookRouter.get('/top', async(req, res) => { 
    try{
        const topBooks= await BookModel.getTopBooks(req.query.size);
        res.json(topBooks);}
    catch(e){console.log(e.message);}
})    
/* get specific book info */
bookRouter.get('/:bookid', async(req, res, next) => {
        const Id = req.params.bookid;
        // const book = await BookModel.findbyId(Id).populate('authors', 'fname').populate('categories', 'name');
        const book = await BookModel.find({_id:Id}).populate('authors', 'fname').populate('categories', 'name');
        res.json(book);
})
module.exports = bookRouter