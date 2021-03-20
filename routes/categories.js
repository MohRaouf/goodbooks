const express=require('express')
const CategoryRouter=express.Router()
const CategortModel=require('../models/categories')

/* get all categories*/
CategoryRouter.get('/',async (req,res,next)=>{
    const categories=await CategortModel.find({});
    res.json(categories);
})
/* get specific category */
CategoryRouter.get('/:categoryid',async (req,res,next)=>{
    const Id=req.params.categoryid;
    const category=await CategoryRouter.findbyId(Id).populate('books').populate('authors');
    res.json(category)
})
/* get popular categories */
CategoryRouter.get('/top',async (req,res,next)=>{
    const topCategories=await CategortModel.find({ books: { $size: { $gt:10 }}});
    res.json(topCategories);
})
module.exports=CategoryRouter