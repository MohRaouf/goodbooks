const express = require('express');
const authorRouter = express.Router();
//when request to get all authors
authorRouter.get("/", (request,response)=>{

})
//when request to get certain author
authorRouter.get("/:author_id",(request,response)=>{

})
//when request to get popular author
authorRouter.get("/top",(request,response)=>{

})
module.exports = authorRouter;