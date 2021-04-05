const jwt = require('jsonwebtoken');
const AdminModel = require('../models/admin')

function  isAdmin(req, res, next) {
    AdminModel.findById(req.userId.userId).then((doc)=>{
        if(doc){
            next();
        }else{
            return res.sendStatus(401)
        }
    }).catch((err)=>{
        console.error(err)
        return res.sendStatus(500)
    })
}

function verifyAccessToken(req, res, next) {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.sendStatus(401) //HTTP 401 Unauthorized client error status

    jwt.verify(token, process.env.ACCESS_TOKEN_SECERET, (err, userId) => {
        console.log("JWT - Verify")
        if (err) {
            console.log('HTTP 403 Forbidden client')
            return res.sendStatus(403) //HTTP 403 Forbidden client error status
        }
        if (userId) {
            console.log(userId)
            req.userId = userId
            console.log('Authenticated Successfully')
            next()
        } else {
            return res.sendStatus(403) //HTTP 403 Forbidden client error status
        }
    })
}

function generateAcessToken(userId) {
    return (jwt.sign(userId, process.env.ACCESS_TOKEN_SECERET, { expiresIn: '1h' })) //1 Hour
}

function generateRefreshToken(userId) {
    return (jwt.sign(userId, process.env.REFRESH_TOKEN_SECRET))
}

module.exports = {
    verifyAccessToken,
    generateAcessToken,
    generateRefreshToken,
    isAdmin
}