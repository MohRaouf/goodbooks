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
userRouter.get("/all",(request,response)=>{

})
//to get all books of user and token in header
userRouter.get("/want",(request,response)=>{
//console.log(request.query)
})
//to get all books of user and token in header
userRouter.get("/current",(request,response)=>{

})
//to get all books of user and token in header
userRouter.get("/read",(request,response)=>{

})  

//when editing in rating or shelve in user home //querystring = "/?status=r&rating=3"
userRouter.patch("/:bookid",(request,response)=>{
//console.log(request.query.status)
})

module.exports = userRouter;