const express = require('express');
const userRouter = express.Router();
const UserModel = require('../models/user')
const authenticateToken = require('../helpers/methods')

/* Sign up New User */
userRouter.post("/signup", async(req, res) => {

    const userInstance = new UserModel({
        username: req.body.username,
        fname: req.body.fname,
        lname: req.body.lname,
        dob: req.body.dob,
        email: req.body.email,
        gender: req.body.gender,
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

/* Logout --> Delete User Refresh Token From DB */
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

/* User Info */
userRouter.get("/", authenticateToken, async(req, res) => {

})

//to get all books of user and token in header
userRouter.get("/books", authenticateToken, async(req, res) => {

})

//when editing in rating or shelve in user home
userRouter.patch("/:bookid", authenticateToken, async(req, res) => {

})

module.exports = userRouter;