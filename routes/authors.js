const express = require('express');
const authorRouter = express.Router();
const AuthorModel=require('../models/author')
//when request to get all authors
authorRouter.get("/", (request,response)=>{

})
//when request to get certain author
authorRouter.get("/:author_id",(request,response)=>{

})
//when request to get popular author
authorRouter.get("/top/:number",async (request,response)=>{
    const topAuthors=await AuthorModel.getTopAuthors(req.params.number);
        response.json(topAuthors);
})
module.exports = authorRouter;