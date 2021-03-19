const mongoose = require('mongoose')
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/blogApp'
mongoose.connect(MONGODB_URL, {
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true
},(err) => {
    if (err) console.error(err)
    else console.log("Connected To DB")
})

