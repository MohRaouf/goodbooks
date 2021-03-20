const express=require('express')
const categoryRouter=express.Router()
const CategortModel=require('../models/categories')

/* get all categories*/
categoryRouter.get('/',async (req,res,next)=>{
    const categories=await CategortModel.find({});
    res.json(categories);
})
/* get specific category */
categoryRouter.get('/:categoryid',async (req,res,next)=>{
    const Id=req.params.categoryid;
    const category=await categoryRouter.findbyId(Id).populate('books','name').populate('authors','fname');
    res.json(category)
})
/* get popular categories */
categoryRouter.get('/top',async (req,res,next)=>{
    const topCategories=await CategortModel.find({ books: { $size: { $gt:10 }}});
    res.json(topCategories);
})
mocule.exports=categoryRouter