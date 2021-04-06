var cors = require('cors')

require('dotenv').config()
require("./boot/dbConnecion");
const { json, urlencoded } = require('express');
const express = require('express');

/* Requires Router Modules */
const adminRouter = require('./routes/admins');
const userRouter = require('./routes/users');
const authorRouter = require('./routes/authors');
const categoryRouter = require('./routes/categories')
const bookRouter = require('./routes/books')

const PORT = process.env.PORT || 3000
const app = express()

app.use(cors()) // Use this after the variable declaration

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));

/*  Routes */
app.use('/categories', categoryRouter);
app.use('/books', bookRouter);
app.use("/users", userRouter);
app.use("/authors", authorRouter);
app.use("/admins", adminRouter);
//////////////

// Application Level Middleware to trap request Info
app.use("/", (req, res) => {
    console.log(`Application Level Middleware : { Time : ${new Date()} , Method : ${req.method} , URL : ${req.url}}`);
    res.send("OK")
})

/* Start The HTTP Server */
app.listen(PORT, (err) => {
    if (err) console.log(err)
    else console.log(`Server Started On Port : ${PORT}`)
})