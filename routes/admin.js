const express = require('express');
const adminRouter = express.Router();
const jwt = require('jsonwebtoken');
const authRouter = require('./auth');

adminRouter.use("/auth", authRouter);
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

module.exports = adminRouter;