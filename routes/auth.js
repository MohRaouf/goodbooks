const express = require('express');
const authRouter = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

// refreshTokes = []
var adminInfo = { username: "Raouf", password: "1122", refreshToken: "" }



//Login and send Access Token + Refresh Token
authRouter.post("/", async(req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    //Verify Login Info from Database
    // const adminInfo = await AdminModel.findOne({ username: reqUsername })
    //     .catch((err) => {
    //         console.error(err);
    //         return res.sendStatus(503)
    //     })


    if (adminInfo) {

        if (await bcrypt.compare(reqPassword, await bcrypt.hash(adminInfo.password, 10))) {
            console.log("Admin Logged In Successfully")
            const username = { username: reqUsername }
            const accessToken = generateAcessToken(username)
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET)
            adminInfo.refreshToken = refreshToken
                // refreshTokens.push(refreshToken)
            return res.json({ accessToken: accessToken, refreshToken: refreshToken })
        } else {
            console.log('Invalid Username Or Password')
            return res.sendStatus(401)
        }
    } else {
        console.error(err);
        console.log('Server Internal Error 503')
        return res.sendStatus(503)
    }
})

//Update and Send the Access Token by Refresh Token
authRouter.get("/", async(req, res) => {
    // console.log("Admin Refresh Token : ", adminInfo.refreshToken)
    const refreshToken = req.body.refToken;
    // console.log("body Refresh Token : ", refreshToken)

    if (refreshToken == null) return res.sendStatus(401);
    // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)
    if (adminInfo.refreshToken != refreshToken) return res.sendStatus(403)
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const newAccessToken = generateAcessToken({ username: user.username })
        res.json({ accessToken: newAccessToken })
    })

})

authRouter.delete('/', async(req, res) => {
    adminInfo.refreshToken = "";
    console.log('RefreshToked Deleted')
    res.sendStatus(204);
})

function generateAcessToken(username) {
    return (jwt.sign(username, process.env.ACCESS_TOKEN_SECERET, { expiresIn: '25s' })) //50 mins
}

module.exports = authRouter;