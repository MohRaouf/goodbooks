const express = require('express');
const authorRouter = express.Router();
const AuthorModel=require('../models/author')
//when request to get all authors
authorRouter.get("/", (request,response)=>{

})
//when request to get popular author
// >>> with query
authorRouter.get("/top",async (request,response)=>{
    try{
        const topAuthors=await AuthorModel.getTopAuthors(request.query.size);
        response.json(topAuthors);}
    catch(e){console.log(e.message);}
})
//when request to get certain author
authorRouter.get("/:author_id",(request,response)=>{

})
module.exports = authorRouter;