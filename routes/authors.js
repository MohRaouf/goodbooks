const express = require('express');
const AuthorModel = require('../models/author')
const jwtHelpers = require('../helpers/jwt_helper')
const authorRouter = express.Router();

/* Get All Authors no need for Authentication */
authorRouter.get("/", async(req, res) => {

})
//when request to get popular author
// >>> with query
authorRouter.get("/top",async (request,response)=>{
    try{
        const topAuthors=await AuthorModel.getTopAuthors(request.query.size);
        response.json(topAuthors);}
    catch(e){console.log(e.message);}
})

/* Get Author by ID no need for Authentication */
authorRouter.get("/:author_id", async(req, res) => {

})

/* Insert new Author need Authentication */
authorRouter.post("/", jwtHelpers.verifyAccessToken, async(req, res) => {
    const authorInfo = {
        fname: req.body.fname,
        lname: req.body.lname, //optional
        ...(req.body.photo ? { photo: req.body.photo } : {}), //optional
        ...(req.body.dob ? { dob: req.body.dob } : {}), //optional
        ...(req.body.gender ? { gender: req.body.gender } : {}), //optional
    }
    await AuthorModel.create(authorInfo).then((author) => {

        console.log(`Author ${authorInfo.fname} ${authorInfo.lname} Added Successfully`)
        return res.status(201).send("Created")

    }).catch((err) => {

        console.error(err);
        return res.status(500).send("Failed To Add New Author")

    })
})

/* Update Author with ID need Authentication */
authorRouter.patch("/:author_id", async(req, res) => {

})

/* Delete Author with ID need Authentication */
authorRouter.delete("/:author_id", async(req, res) => {

})

module.exports = authorRouter;