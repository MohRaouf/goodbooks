const express = require("express");
const adminRouter = express.Router();
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/admin')
const jwtHelpers = require('../helpers/jwt_helper')

adminRouter.get("/", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, async (req, res) => {
    res.send("OK")
})

//Sign up 
adminRouter.post("/signup", (req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    const adminInstance = new AdminModel({
        username: reqUsername,
        password: reqPassword
    })
    adminInstance.save().then((admin) => {
        res.status(201).end();
    }).catch((err) => {
        if (err.code == 11000) {
            return res.status(409).end() // username duplication - conflict
        }
        return res.sendStatus(500)
    })
});

/** get the logged in admin info */
adminRouter.get("/login", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, (req, res) => {
    const adminId = req.userId;
    AdminModel.findById(adminId)
        .then((adminInfo) => {
            return res.json(adminInfo)
        }).catch((err) => {
            return res.status(401).end()
        })
});

//Login and send Access Token + Refresh Token
adminRouter.post("/login", async (req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    try {
        // Verify username from Database
        const adminInstance = await AdminModel.findOne({ username: reqUsername })

        //Username Found
        if (adminInstance) {
            if (await adminInstance.isValidPassword(reqPassword)) {

                const userId = { userId: adminInstance.id }
                const accessToken = jwtHelpers.generateAccessToken(userId)
                const refreshToken = jwtHelpers.generateRefreshToken(userId)

                AdminModel.updateOne({ _id: adminInstance.id }, { refreshToken: refreshToken }).then((result) => {
                    if (result) return res.json({ accessToken: accessToken, refreshToken: refreshToken })
                    return res.status(401).end()
                }).catch((err) => {
                    return res.status(500).end()
                })
            } else {
                console.log('Invalid Username Or Password')
                return res.status(401).end()
            }
        } else {
            console.log('Admin Data NotFound')
            return res.status(401).end()
        }
    } catch (err) {
        return res.status(500).end()
    }
});

//Update and Send New Access Token by Refresh Token
adminRouter.post("/refresh", async (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.statys(401).end();

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {
        if (err) return res.sendStatus(401)
        const userId = userInfo.userId;
        console.log(`Extracted adminId from RefreshToken ==> ${userId}`)

        try {
            const adminInstance = await AdminModel.findById(userId)
            if (!adminInstance) {
                console.error('Admin Refresh Token Is not found')
                return res.status(401).end()
            }
            console.log(`Admin Refresh Token : ${adminInstance.refreshToken}`)
            if (adminInstance.refreshToken != null && adminInstance.refreshToken === refreshToken) {
                const newAccessToken = jwtHelpers.generateAccessToken({ userId: adminInstance.id })
                console.log('Access Token Updated')
                return res.json({ accessToken: newAccessToken })
            }
            console.error('Admin Refresh Token Is not set')
            return res.status(401).end()

        } catch (err) {
            return res.status(500).end()
        }
    })
})

adminRouter.post('/logout', (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {

        if (err) return res.status(401).end()
        const userId = userInfo.userId;
        console.log(`Extracted userId from RefreshToken ==> ${userId}`)
        try {
            const adminInstance = await AdminModel.updateOne({ _id: userId }, { refreshToken: null }, { new: true })
            if (!adminInstance) {
                console.error('Admin Refresh Token Is not found')
                return res.status(401).end()
            }
            // console.log(`${adminInstance}`)
            console.log(`Admin ID : ${userId} Logged out - Refresh Token Reset`)
            return res.status(200).end()
        } catch (err) {
            return res.status(500).end()
        }
    })
})

module.exports = adminRouter;
