const express = require('express');
const userRouter = express.Router();
//check if email and password is valid and if valid send token
//email and password in body
userRouter.post("/login", (request,response)=>{

})
//when having token in header and check if valid and get the user from db
userRouter.get("/", (request,response)=>{

})
//store the new user and send token
//(firstName,lastName,email,password,image) in body
userRouter.post("/signup", (request,response)=>{

})
//when user sign out and token in header
userRouter.get("/logout",(request,response)=>{

})
//to get all books of user and token in header
userRouter.get("/books",(request,response)=>{

})
//when editing in rating or shelve in user home
userRouter.patch("/:bookid",(request,response)=>{

})
module.exports = userRouter;