const express = require('express');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user')
const jwtHelpers = require('../helpers/jwt_helper')
const userRouter = express.Router();

/* Sign up New User */
userRouter.post("/signup", async (req, res) => {

    const userInstance = new UserModel({
        username: req.body.username,
        fname: req.body.fname,
        lname: req.body.lname,
        password: req.body.password,
        dob: req.body.dob,
        email: req.body.email,
        gender: req.body.gender,
        ...(req.body.photo ? { photo: req.body.photo } : {})
    })
    console.log(userInstance)
    await userInstance.save().then((user) => {
        console.log(`New User Added : ${user}`)
        return res.sendStatus(201);
    }).catch((err) => {
        console.error("====Error===>", err)
        if (err.code == 11000) { /* username duplication - conflict */
            return res.status(409).send("Duplicated Username")
        }
        return res.sendStatus(500)
    })
})

/* Login --> Send Access Token + Refresh Token */
userRouter.post("/login", async (req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    // Verify Login Info from Database
    const userInstance = await UserModel.findOne({ username: reqUsername })
        .catch((err) => {
            console.error(err)
            return res.sendStatus(503)
        })

    //User Found
    if (userInstance) {
        if (await userInstance.isValidPassword(reqPassword)) {

            const userId = { userId: userInstance.id }
            const accessToken = jwtHelpers.generateAcessToken(userId)
            const refreshToken = jwtHelpers.generateRefreshToken(userId)

            UserModel.updateOne({ _id: userInstance.id }, { refreshToken: refreshToken }).then((result) => {
                if (result) return res.json({ accessToken: accessToken, refreshToken: refreshToken })
                else return res.sendStatus(500)
            }).catch((err) => {
                console.log(err)
                return res.sendStatus(500)
            })

        } else {
            console.log('Invalid Username Or Password')
            return res.sendStatus(401)
        }
    } else {
        console.log('User Data NotFound')
        return res.sendStatus(403)
    }
})

/* Update Access Token */
userRouter.get("/login", async (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    console.log(`Body Refresh Token : ${refreshToken}`)

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {
        if (err) return res.sendStatus(403)
        const userId = userInfo.userId;
        console.log(`Extracted UserId from RefreshToken ==> ${userId}`)

        const userInstance = await UserModel.findById(userId)
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })

        if (!userInstance) {
            console.error('User not found')
            return res.status(404).send(`User Doesn't Exist`)
        }
        console.log(`User Refresh Token : ${userInstance.refreshToken}`)
        if (userInstance.refreshToken != null && userInstance.refreshToken === refreshToken) {
            const newAccessToken = jwtHelpers.generateAcessToken({ userId: userId})
            console.log('Access Token Updated')
            return res.json({ accessToken: newAccessToken })
        }

        console.error('User Refresh Token Is not Set')
        return res.status(401).send(`User Refresh Token Is not Set`)
    })
})

/* Logout --> Delete User Refresh Token From DB */
userRouter.post("/logout", async (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {

        if (err) return res.sendStatus(403)
        const userId = userInfo.userId;
        console.log(`Extracted userId from RefreshToken ==> ${userId}`)

        const userInstance = await UserModel.updateOne({ _id: userId }, { refreshToken: null }, { new: true })
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })
        if (!userInstance) {
            console.error('User not found')
            return res.sendStatus(401)
        }
        console.log(`${userInstance}`)
        console.log(`User Logged out - Refresh Token Reset`)
        return res.sendStatus(200)
    })

})

/* User Book Shelf Info Info */
userRouter.get("/", jwtHelpers.verifyAccessToken, async (req, res) => {
    // const username = req.user;
    // const userInfo = await UserModel.findOne({ username: username }).catch((err) => {
    //     console.error(err);
    //     return res.sendStatus(503)
    // })

    // // Check of  Query String for Page Numer and Book Status then Apply Filters on the USER bookshelf
    // /////////////////////////////////////////////////////////////////////////////////////////////////
    // return res.json(userInfo)
    res.send('OK')
})


//when editing in rating or shelve in user home
userRouter.patch("/:bookid", jwtHelpers.verifyAccessToken, async (req, res) => {
    const username = req.user;


})

module.exports = userRouter;