const express = require("express");
const adminRouter = express.Router();
const jwt = require('jsonwebtoken');
const AdminModel = require('../models/admin')
const jwtHelpers = require('../helpers/jwt_helper')

adminRouter.get("/", jwtHelpers.verifyAccessToken, jwtHelpers.isAdmin, async (req, res) => {
    res.send("OK")
})

//Sign up 
adminRouter.post("/signup", async (req, res) => {
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
    .catch((err) => {
      console.error("====Error===>", err);
      if (err.code == 11000) {
        return res.status(409).send("Duplicated Username"); // username duplication - conflict
      }
      res.sendStatus(500);
    });
});

//Login and send Access Token + Refresh Token
adminRouter.post("/login", async (req, res) => {
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

            const userId = { userId: adminInstance.id }
            const accessToken = jwtHelpers.generateAcessToken(userId)
            const refreshToken = jwtHelpers.generateRefreshToken(userId)

            AdminModel.updateOne({ _id:adminInstance.id }, { refreshToken: refreshToken }).then((result) => {
               if(result) return res.json({ accessToken: accessToken, refreshToken: refreshToken })
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
        console.log('Admin Data NotFound')
        return res.sendStatus(401)
    }
});

//Update and Send New Access Token by Refresh Token
adminRouter.post("/refresh", async (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {
        if (err) return res.sendStatus(401)
        const userId = userInfo.userId;
        console.log(`Extracted adminId from RefreshToken ==> ${userId}`)

        const adminInstance = await AdminModel.findById(userId)
            .catch((err) => {
                console.error(err);
                return res.sendStatus(500)
            })

        if (!adminInstance) {
            console.error('Admin Refresh Token Is not found')
            return res.status(401).send(`Admin Doesn't Exist`)
        }
        console.log(`Admin Refresh Token : ${adminInstance.refreshToken}`)
        if (adminInstance.refreshToken != null && adminInstance.refreshToken === refreshToken) {
            const newAccessToken = jwtHelpers.generateAcessToken({ userId: adminInstance.id })
            console.log('Access Token Updated')
            return res.json({ accessToken: newAccessToken })
        }

        console.error('Admin Refresh Token Is not set')
        return res.status(401).send(`Refresh Token Is not set`)
    })
})

adminRouter.post('/logout', async (req, res) => {

    const refreshToken = req.body.refreshToken;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, userInfo) => {

        if (err) return res.sendStatus(403)
        const userId = userInfo.userId;
        console.log(`Extracted userId from RefreshToken ==> ${userId}`)

        const adminInstance = await AdminModel.updateOne({ _id: userId }, { refreshToken: null }, { new: true })
            .catch((err) => {
                console.error(err);
                return res.sendStatus(503)
            })
        if (!adminInstance) {
            console.error('Admin Refresh Token Is not found')
            return res.sendStatus(401)
        }
        // console.log(`${adminInstance}`)
        console.log(`Admin ID : ${userId} Logged out - Refresh Token Reset`)
        return res.sendStatus(200)
    })
})

module.exports = adminRouter;
