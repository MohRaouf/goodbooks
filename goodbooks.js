require('dotenv').config()
require("./boot/dbConnecion");
const { json, urlencoded } = require('express');
const express = require('express');
const adminRouter = require('./routes/admins');

const PORT = process.env.PORT || 3000
const app = express()

app.use(json())
app.use(urlencoded({ extended: true }))

app.use("/admin", adminRouter);

app.use("/", (req, res) => {
    console.log(`Application Level Middleware : { Time : ${new Date()} , Method : ${req.method} , URL : ${req.url}}`);
    res.send("OK")
})

app.listen(PORT, (err) => {
    if (err) console.log(err)
    else console.log(`Server Started On Port : ${PORT}`)
})