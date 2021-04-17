const mongoose = require('mongoose')
// const MONGODB_URL ="mongodb+srv://T-Book:T-Book@t-book.qsljh.mongodb.net/z3bola?retryWrites=true&w=majority"

const MONGODB_URL ="mongodb+srv://team7-ninjas:123intake41@goodbookscluster.mrby6.mongodb.net/goodbooks?retryWrites=true&w=majority"
// const MONGODB_URL ="mongodb+srv://team7-ninjas:123intake41@goodbookscluster.mrby6.mongodb.net/awesome-reads?retryWrites=true&w=majority"
mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err) => {
    if (err) console.error(err)
    else console.log("Connected To Atlas DB")
})
