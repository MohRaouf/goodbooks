const express = require('express');
const adminRouter = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')
const AdminModel = require('../models/admin')


adminRouter.get("/", authenticateToken, async(req, res) => {

})

// Middleware to parse the JWT Token in the Header
// and modify the request body with the parsed data
// Which is the an object {username : "username"}
function authenticateToken(req, res, next) {
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
        res.send("OK")
        next()
    })
}

//Sign up 
adminRouter.patch("/auth", async(req, res) => {
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
adminRouter.post("/auth", async(req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    // Verify Login Info from Database
    const adminInstance = await AdminModel.findOne({ username: reqUsername })
        .catch((err) => {
            console.error(err)
            return res.sendStatus(503)
        })

    //Username Found
    if (adminInstance) {
        if (await bcrypt.compare(reqPassword, adminInstance.password)) {
            console.log("Admin Logged In Successfully")
            const username = { username: reqUsername }
            const accessToken = generateAcessToken(username)
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET)

            // adminInstance.refreshToken = refreshToken;
            AdminModel.updateOne({ username: reqUsername }, { refreshToken: refreshToken }, { new: true })
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
        console.log('Admin Data NotFound')
        return res.sendStatus(403)
    }
})

//Update and Send New Access Token by Refresh Token
adminRouter.get("/auth", async(req, res) => {

    const refreshToken = req.body.refToken;
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

        if (adminInstance.refreshToken != null && adminInstance.refreshToken === refreshToken) {
            console.log(`${adminInstance.refreshToken}`)
            const newAccessToken = generateAcessToken({ username: user.username })
            console.log('Access Token Updated')
            return res.json({ accessToken: newAccessToken })
        }

        console.error('Admin Refresh Token Is not found')
        return res.status(401).send(`${username} Logged Out`)
    })
})

adminRouter.delete('/auth', async(req, res) => {

    const refreshToken = req.body.refToken;
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

function generateAcessToken(username) {
    return (jwt.sign(username, process.env.ACCESS_TOKEN_SECERET, { expiresIn: '25s' })) //50 mins
}

module.exports = adminRouter;