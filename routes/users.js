const deleteRate = require('../helpers/calculated_helper');
const express = require('express');
const userRouter = express.Router();
const UserModel = require('../models/user')
const BookModel = require("../models/book");
const authenticateToken = require('../helpers/methods')
const mongoose = require('mongoose')
const calculatedHelper = require("../helpers/calculated_helper");
/* Sign up New User */
userRouter.post("/signup", async(req, res) => {

    const userInstance = new UserModel({
        username: req.body.username,
        fname: req.body.fname,
        lname: req.body.lname,
        password:req.body.password,
        dob: req.body.dob,
        email: req.body.email,
        gender: req.body.gender,
        bookshelf:req.body.bookshelf,
        ...(req.body.photo ? { photo: req.body.photo } : {})
    })
    await userInstance.save().then((user) => {
        console.log(`New User Added : ${user}`)
        res.sendStatus(201);
    }).catch((err) => {
        console.error("====Error===>", err)
        if (err.code == 11000) {
            return res.status(409).send("Duplicated Username") // username duplication - conflict
        }
        res.sendStatus(500)
    })
})

/* Login --> Send Access Token + Refresh Token */
userRouter.post("/login", async(req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    // Verify Login Info from Database
    const userInstance = await UserModel.findOne({ username: reqUsername })
        .catch((err) => {
            console.error(err)
            return res.sendStatus(503)
        })

    //Username Found
    if (userInstance) {
        if (await bcrypt.compare(reqPassword, userInstance.password)) {
            console.log(`User ${reqUsername} Logged In Successfully`)

            const username = { username: reqUsername }
            const accessToken = generateAcessToken(username)
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET)

            UserModel.updateOne({ username: reqUsername }, { refreshToken: refreshToken }, { new: true })
                .catch((err) => {
                    console.error("====Error===>", err)
                    return res.sendStatus(500)
                })

            return res.json({ accessToken: accessToken, refreshToken: refreshToken })

        } else {
            console.log('Invalid Username Or Password')
            return res.sendStatus(401)
        }
    } else {
        console.log('User Data NotFound')
        return res.sendStatus(403)
    }
})

/* Logout --> Delete User Refresh Token From DB*/
userRouter.get("/logout", async(req, res) => {

    const refreshToken = req.body.refToken;
    if (refreshToken == null) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, user) => {
        if (err) return res.sendStatus(403)
        const username = user.username;
        console.log(`Extracted Username from RefreshToken ==> ${username}`)

        const userInstance = await UserModel.findOne({ username: username })
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })

        if (!userInstance) {
            console.error(`Admin Doesn't Exist`)
            return res.status(404).send(`Admin Doesn't Exist`)
        }

        if (userInstance.refreshToken != null && userInstance.refreshToken === refreshToken) {
            console.log(`${userInstance.refreshToken}`)
            const newAccessToken = generateAcessToken({ username: user.username })
            console.log('Access Token Updated')
            return res.json({ accessToken: newAccessToken })
        }

        console.error('User Refresh Token Is not found') //null
        return res.status(401).send(`${username} Logged Out`)
    })

})

/* User Book Shelf Info Info */
userRouter.get("/", authenticateToken, async(req, res) => {
    const username = req.user;
    const userInfo = await UserModel.findOne({ username: username }).catch((err) => {
        console.error(err);
        return res.sendStatus(503)
    })

    // Check of  Query String for Page Numer and Book Status then Apply Filters on the USER bookshelf
    /////////////////////////////////////////////////////////////////////////////////////////////////
    return res.json(userInfo)
})


//when editing in rating or shelve in user home
// userRouter.patch("/:bookid", authenticateToken, async(req, res) => {
//     const username = req.user;
//     //const {bookId} = req.params
//     console.log(user);
//     // console.log(bookId) 
// })
userRouter.patch("/:bookId", async (req,res)=>{
    const username = req.body.username;
    const bookId = req.params.bookId;
    const bookshelf = req.body.bookshelf;
    const rate = req.body.bookshelf.rate;
    const status = req.body.bookshelf.status;

    const newStatus = req.body.newStatus;
    const bookAvg = req.body.bookAvg;
    const newRate= req.body.newRate;

    try{
        await UserModel.findOneAndUpdate({username:username,'bookshelf.bookId':bookId},
        {
            ...(bookshelf.rate ? { "bookshelf.$.rate": newRate }: {}),
            ...(bookshelf.status ? { "bookshelf.$.status": newStatus}: {})
            /////////////////////////////////
        }).then( (userDoc)=>{
                BookModel.findOne(
                    {_id :mongoose.Types.ObjectId(bookId)}
                ).then((bookDoc)=>{
                const oldRate = bookDoc.avgRating;
                const ratingCount = bookDoc.ratingCount;
                console.log(bookDoc)
                BookModel.findOneAndUpdate({_id :mongoose.Types.ObjectId(bookId)},{
                    $set:{
                        avgRating : calculatedHelper.editBookRate(bookAvg,ratingCount,rate,newRate)
                    }
                }).then((data)=>{
                    res.sendStatus(200)
                })
            })
        })
    }catch(e){ 
        res.sendStatus(503).sendStatus(e.message)
    }
    /**
     * oldAvg
     * count 
     * 
     */
    // if(rate != null && status != null){
    //     try{
    //         await UserModel.findOneAndUpdate({username:username,'bookshelf.bookId':bookId},{
    //           ...(bookshelf.rate ? { "bookshelf.$.rate": bookshelf.rate }: {}),
    //           ...(bookshelf.status ? { "bookshelf.$.status": bookshelf.status }: {})
    //         }).then((data)=>{
    //             console.log(data)
    //         })
    //     }catch(e){
    //         res.sendStatus(404).sendStatus(e.message)
    //     }
    // }else if(rate != null){

    //     try{
    //         await UserModel.findOneAndUpdate({username:username,'bookshelf.bookId':bookId},{
    //           ...(bookshelf.rate ? { "bookshelf.$.rate": bookshelf.rate }: {})
    //         }).then((data)=>{
    //             console.log(data)
    //         })
    //     }catch(e){
    //         res.sendStatus(404).sendStatus(e.message)
    //     }
    // }else if(status != null){

    //     try{
    //         await UserModel.findOneAndUpdate({username:username,'bookshelf.bookId':bookId},{
    //           ...(bookshelf.status ? { "bookshelf.$.status": bookshelf.status }: {})
    //         }).then((data)=>{
    //             console.log(data)
    //         })
    //     }catch(e){
    //         res.sendStatus(404).sendStatus(e.message)
    //     }
    // }else{
    //     try{
        
    //     }catch(e){
    //         res.sendStatus(404).sendStatus(e.message)
    //     }
    // }
   
})
module.exports = userRouter;












/**\
 * 
 * 
 * {
    "username": "mostafa",
    "bookshelf": {
        "bookId":"605b73578bfeb06773557dcb",
        "rate":3,
        "status":"w"
        },
        "newRate": 2,
        "bookAvg": 3.5
}
 */