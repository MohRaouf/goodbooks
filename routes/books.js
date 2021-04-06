const express = require('express')
const bookRouter = express.Router()
const jwtHelpers = require('../helpers/jwt_helper')
const { populate } = require('../models/author')
const BookModel = require('../models/book')
const AuthorModel = require('../models/author')

/* Get All Books no need for Authentication */
bookRouter.get("/", async(req, res) => {
    const allBooks = await BookModel.find().select("_id name description authorId categoryId photo")
    .populate({ path: 'authorId', select: '_id fname lname' })
    .populate({ path: 'categoryId', select: '_id   name' })
        .catch((err) => {
            console.error(err)
            return res.status(400).send("Bad Request")
        })
    console.log("All Books : ", allBooks)
    return res.json(allBooks);
})

bookRouter.get('/top', async(req, res) => { 
        // const topBooks= await BookModel.getTopBooks(req.query.size)
        const topBooks= await BookModel.getTopBooks(4)
        .catch((err)=>{return res.status(500).send("Internal Server Error")})
        if(topBooks){return res.json(topBooks);}
        else {return res.status(404).send("Not Found")}
})    


/* Get Book by ID no need for Authentication */
bookRouter.get("/:book_id", async(req, res) => {
    const id = req.params.book_id;
    console.log(id)
    const book = await BookModel.findById(id).populate({ path: 'authorId', select: '_id fname lname' })
        .populate({ path: 'categoryId', select: '_id   name' })
        .catch((err) => {
            console.log(err)
            return res.status(500).send('Internal server error')
        })
    if (book) {
        console.log(book)
        return res.json(book);
    }
    console.log('Not Found')
    return res.status(404).send("Not Found")
})
/* Insert new Book need Authentication */
bookRouter.post("/", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {
    const bookInfo = {
        name: req.body.name,
        ...(req.body.photo ? { photo: req.body.photo } : {}), //optional
        description: req.body.description,
        authorId: req.body.authorId,
        categoryId: req.body.categoryId
    }
    console.log(bookInfo)
    await BookModel.create(bookInfo).catch(err => {
        console.error(err);
        return res.status(500).send("Failed To Add New Book")
    }).then(book => {
        console.log(`Book ${book.name} Added Successfully`)
        return res.status(201).send("Created")
    })
})

/* Update Book with ID need Authentication */
bookRouter.patch("/:book_id", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {

    const id = req.params.book_id;
    console.log(`Updating Book ID : ${id}`)

    const newBookInfo = {
        ...(req.body.name ? { name: req.body.name } : {}),
        ...(req.body.photo ? { photo: req.body.photo } : {}),
        ...(req.body.description ? { lastname: req.body.description } : {}),
        ...(req.body.categoryId ? { categoryId: req.body.categoryId } : {}),
        ...(req.body.authorId ? { authorId: req.body.authorId } : {}),

    }
    console.log(`Updated Info : ${newBookInfo}`)
    const updatedDoc = await BookModel.findByIdAndUpdate({ _id: id }, newBookInfo, { new: true, useFindAndModify: false }).
    catch((err) => {
        console.error("====Error===>", err)
        return res.status(400).send("Bad Request")
    })
    if (updatedDoc) {
        console.log(`Updated Info : ${updatedDoc}`)
        return res.status(202).send("Accepted")
    }

})


/* Delete Book with ID need Authentication */
bookRouter.delete("/:book_id", jwtHelpers.verifyAccessToken,jwtHelpers.isAdmin, async(req, res) => {
    const id = req.params.book_id;
    const docToDelete = await BookModel.findByIdAndDelete(id)
        .catch((err) => {
            console.error(err)
            return res.status(500).send("Internal server error")
        })
    if (docToDelete) {
        console.log(`Book ID : ${id} Deleted`)
        return res.status(200).send("Deleted")
    }
    console.log(`Book Not Found`)
    return res.status(404).send("Book not found")
})

module.exports = bookRouter