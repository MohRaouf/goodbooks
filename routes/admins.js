const express = require('express');
const adminRouter = express.Router();
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/admin')
const jwtHelpers = require('../helpers/jwt_helper')

adminRouter.get("/", jwtHelpers.verifyAccessToken, async(req, res) => {
    res.send("OK")
})

//Sign up 
adminRouter.post("/signup", async(req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    const adminInstance = new AdminModel({
        username: reqUsername,
        password: reqPassword
    })
    await adminInstance.save().then((admin) => {
        console.log(`New Admin Added : ${admin}`)
        res.sendStatus(201);
    }).catch((err) => {
        console.error("====Error===>", err)
        if (err.code == 11000) {
            return res.status(409).send("Duplicated Username") // username duplication - conflict
        }
        res.sendStatus(500)
    })
})

//Login and send Access Token + Refresh Token
adminRouter.post("/login", async(req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    // Verify username from Database
    const adminInstance = await AdminModel.findOne({ username: reqUsername }).catch((err) => {
        console.error(err)
        return res.sendStatus(503)
    })

    //Username Found
    if (adminInstance) {
        if (await adminInstance.isValidPassword(reqPassword)) {

            const username = { username: reqUsername }
            const accessToken = jwtHelpers.generateAcessToken(username)
            const refreshToken = jwtHelpers.generateRefreshToken(username)

            if (adminInstance.setRefreshToken(refreshToken)) {
                console.log(`${reqUsername} Logged in Successfully !`)
                return res.json({ accessToken: accessToken, refreshToken: refreshToken })
            } else return res.sendStatus(500)

        } else {
            console.log('Invalid Username Or Password')
            return res.sendStatus(403)
        }
    } else {
        console.log('Admin Data NotFound')
        return res.sendStatus(401)
    }
})

//Update and Send New Access Token by Refresh Token
adminRouter.get("/login", async(req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, user) => {
        if (err) return res.sendStatus(403)
        const username = user.username;
        console.log(`Extracted Username from RefreshToken ==> ${username}`)

        const adminInstance = await AdminModel.findOne({ username: username })
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })

        if (!adminInstance) {
            console.error('Admin Refresh Token Is not found')
            return res.status(404).send(`Admin Doesn't Exist`)
        }
        console.log(`Admin Refresh Token : ${adminInstance.refreshToken}`)
        if (adminInstance.refreshToken != null && adminInstance.refreshToken === refreshToken) {
            console.log(`${adminInstance.refreshToken}`)
            const newAccessToken = jwtHelpers.generateAcessToken({ username: user.username })
            console.log('Access Token Updated')
            return res.json({ accessToken: newAccessToken })
        }

        console.error('Admin Refresh Token Is not found')
        return res.status(401).send(`${username} Refresh Token Is not found`)
    })
})

adminRouter.post('/logout', async(req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, user) => {

        if (err) return res.sendStatus(403)
        const username = user.username;
        console.log(`Extracted Username from RefreshToken ==> ${username}`)

        const adminInstance = await AdminModel.updateOne({ username: username }, { refreshToken: null }, { new: true })
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })
        if (!adminInstance) {
            console.error('Admin Refresh Token Is not found')
            return res.sendStatus(401)
        }
        console.log(`${adminInstance}`)
        console.log(`${username} Logged out - Refresh Token Reset`)
        return res.sendStatus(200)
    })
})

module.exports = adminRouter;