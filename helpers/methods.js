const mongoose = require('mongoose')
const jwt = require('jsonwebtoken');
const bookModel = require("../models/book");


authenticateToken= function (req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401) //HTTP 401 Unauthorized client error status

    jwt.verify(token, process.env.ACCESS_TOKEN_SECERET, (err, user) => {
        console.log("JWT - Verify")
        if (err) {
            console.log('HTTP 403 Forbidden client')
            return res.sendStatus(403) //HTTP 403 Forbidden client error status
        }
        req.user = user
        console.log('Authenticated Successfully')
            // res.send("OK")
        next()
    })
}

/**
 *  Sub value from average=> (average*N / (const-x)) / (N-1)
 *  Ex.
 *  N = 2  const = 5
 *  3 + 2 = 5=>  5/N = 2.5
 *  2.5, 2 => (total, oldRate)
 *  (2.5*2 / const-2 ) / 2-1
 * 
*/

// exports.updateRate = async function(bookId) {
//     await bookModel.findOne({_id: mongoose.Types.ObjectId(req.body.bookId)}).then((doc)=>{
//         console.log(doc)
//         bookModel.findOneAndUpdate(
//             {_id: mongoose.Types.ObjectId(req.body.bookId)},
//         {
//             // check if user rated the book if yes then update, if no then add
//             $set:{
//                 avgRating: editBookRate(doc.avgRating, doc.ratingCount, parseInt(req.body.rate)),
//                 $inc: { ratingCount: 1}
//             }
//         },{useFindAndModify: false}
//         ).then((doc)=>{
//             console.log("In update:", doc)
//             res.send("UPDATED")
//         }).catch((err)=>{
//         console.log(err)
//         res.send("NOT UPDATED :(")
//         })
//     }).catch((err)=>{
//         console.log("Wrong: ",err)
//     })
// }

module.exports = authenticateToken;
// module.exports = updateRate;


