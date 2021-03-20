const express=require('express')
const BookRouter=express.Router()
const BookModel=require('../models/books')

/* get all books */
BookRouter.get('/',async (req,res,next)=>{
    const books=await BookModel.find({}).populate('author');
    res.json(books)
})
/* get specific book info */
BookRouter.get('/:bookid',async (req,res,next)=>{
    const Id=req.params.bookid;
    const book=await BookModel.findbyId(Id).populate('authors').populate('categories');
    res.json(book);
})
/* get popular books */
BookRouter.get('/top',async (req,res,next)=>{
    const topbooks=await BookModel.find({ avgRating: { $gt:4 }})
})
module.exports=BookRouter