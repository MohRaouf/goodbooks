require('dotenv').config()
require("./boot/dbConnecion");
const { json, urlencoded } = require('express');
const express = require('express');
const adminRouter = require('./routes/admin');
const userRouter = require('./routes/user');
const authorRouter = require('./routes/author');
const CategoryRouter=require('./routes/categories')
const BookRouter=require('./routes/books')
const PORT = process.env.PORT || 3000
const app = express()

app.use(json())
app.use(urlencoded({ extended: true }))

/*  Routes */
app.use('/categories',CategoryRouter);
app,use('/books',BookRouter);
app.use("/users",userRouter);
app.use("/authors",authorRouter);
app.use("/admin", adminRouter);
//////////////

// Application Level Middleware to trap request Info

app.use("/", (req, res) => {
    console.log(`Application Level Middleware : { Time : ${new Date()} , Method : ${req.method} , URL : ${req.url}}`);
    res.send("OK")
})

app.listen(PORT, (err) => {
    if (err) console.log(err)
    else console.log(`Server Started On Port : ${PORT}`)
})