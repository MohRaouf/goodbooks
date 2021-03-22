const jwt = require('jsonwebtoken');

function verifyAccessToken(req, res, next) {
    console.log('here')
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    console.log(token)
    if (token == null) return res.sendStatus(401) //HTTP 401 Unauthorized client error status

    jwt.verify(token, process.env.ACCESS_TOKEN_SECERET, (err, username) => {
        console.log("JWT - Verify")
        if (err) {
            console.log('HTTP 403 Forbidden client')
            return res.sendStatus(403) //HTTP 403 Forbidden client error status
        }
        req.user = username
        console.log('Authenticated Successfully')
            // res.send("OK")
        next()
    })
}

function generateAcessToken(username) {
    console.log(`username in Generation Method : ${username}`)
    return (jwt.sign(username, process.env.ACCESS_TOKEN_SECERET, { expiresIn: '50s' })) //50 mins
}

function generateRefreshToken(username) {
    return (jwt.sign(username, process.env.REFRESH_TOKEN_SECRET))
}

module.exports = {
    verifyAccessToken,
    generateAcessToken,
    generateRefreshToken
}