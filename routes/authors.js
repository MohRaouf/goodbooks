const express = require('express');
const AuthorModel = require('../models/author')
const jwtHelpers = require('../helpers/jwt_helper')
const authorRouter = express.Router();

/* Get All Authors no need for Authentication */
authorRouter.get("/", async(req, res) => {
    const allAuthors = await AuthorModel.find()
        .catch((err) => {
            console.error(err)
            return res.status(400).send("Bad Request")
        })
    console.log("All Authors : ", allAuthors)
    return res.json(allAuthors);
})
//when request to get popular author
// >>> with query
authorRouter.get("/top",async (req,res)=>{
        // const topAuthors=await AuthorModel.getTopAuthors(request.query.size);
        const topAuthors=await AuthorModel.getTopAuthors(1)
        .catch((err)=>{
            console.log(err);
            return res.status(500).send("Internal Server Error")
        })
        if(topAuthors){return res.json(topAuthors)}
        else {return res.status(404).send("Not Found")}
})

/* Get Author by ID no need for Authentication */
authorRouter.get("/:author_id", async(req, res) => {
    const id = req.params.author_id;
    console.log(id)
    const author = await AuthorModel.findById(id).populate({ path: 'books', select: '_id name photo' }).exec()
        .catch((err) => {
            console.log(err)
            return res.status(500).send('Internal server error')
        })
    if (author) {
        console.log(author)
        return res.json(author);
    }
    console.log('Not Found')
    return res.status(404).send("Not Found")
})

/* Insert new Author need Authentication */
authorRouter.post("/", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {
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
authorRouter.patch("/:author_id", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {

    const id = req.params.author_id;
    console.log(`Updating Book ID : ${id}`)

    const newAuthorInfo = {
        ...(req.body.fname ? { fname: req.body.fname } : {}),
        ...(req.body.lname ? { lname: req.body.lname } : {}),
        ...(req.body.photo ? { photo: req.body.photo } : {}),
        ...(req.body.dob ? { dob: req.body.dob } : {}),
        ...(req.body.gender ? { gender: req.body.gender } : {}),
    }
    console.log(`Updated Info : ${newAuthorInfo}`)
    const updatedDoc = await AuthorModel.findByIdAndUpdate({ _id: id }, newAuthorInfo, { new: true, useFindAndModify: false }).
    catch((err) => {
        console.error("====Error===>", err)
        return res.status(400).send("Bad Request")
    })
    if (updatedDoc) {
        console.log(`Updated Info : ${updatedDoc}`)
        return res.status(202).send("Accepted")
    }
    console.log(`Updated Info : ${updatedDoc}`)
    return res.status(404).send("author not found")
})

/* Delete Author with ID need Authentication */
authorRouter.delete("/:author_id", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {
    const id = req.params.author_id;
    const docToDelete = await AuthorModel.deleteOne({ _id: id }, { new: true, useFindAndModify: false })
        .catch((err) => {
            console.error(err)
            return res.status(500).send("Internal server error")
        })
    if (docToDelete) {
        console.log(`Author ID : ${id} Deleted`)
        return res.status(200).send("Deleted")
    }
    console.log(`Author Not Found`)
    return res.status(404).send("Book not found")
})

module.exports = authorRouter;