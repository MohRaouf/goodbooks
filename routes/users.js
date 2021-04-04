const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/user");
const authenticateToken = require("../helpers/methods");
const calculatedHelpers = require("../helpers/calculated_helper");
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const BookModel = require("../models/book");

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
        ...(req.body.photo ? { photo: req.body.photo } : {}),
    });
    await userInstance
        .save()
        .then((user) => {
            console.log(`New User Added : ${user}`);
            res.sendStatus(201);
        })
        .catch((err) => {
            console.error("====Error===>", err);
            if (err.code == 11000) {
                return res.status(409).send("Duplicated Username"); // username duplication - conflict
            }
            res.sendStatus(500);
        });
});

/* Login --> Send Access Token + Refresh Token */
userRouter.post("/login", async (req, res) => {
    const reqUsername = req.body.username;
    const reqPassword = req.body.password;

    // Verify Login Info from Database
    const userInstance = await UserModel.findOne({ username: reqUsername }).catch(
        (err) => {
            console.error(err);
            return res.sendStatus(503);
        }
    );
    //Username Found
    if (userInstance) {
        if (await bcrypt.compare(reqPassword, userInstance.password)) {
            console.log(`User ${reqUsername} Logged In Successfully`);

            const username = { username: reqUsername };
            const accessToken = generateAcessToken(username);
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET);

            UserModel.updateOne(
                { username: reqUsername },
                { refreshToken: refreshToken },
                { new: true }
            ).catch((err) => {
                console.error("====Error===>", err);
                return res.sendStatus(500);
            });

            return res.json({ accessToken: accessToken, refreshToken: refreshToken });
        } else {
            console.log("Invalid Username Or Password");
            return res.sendStatus(401);
        }
    } else {
        console.log("User Data NotFound");
        return res.sendStatus(403);
    }
});

// edit bookshelf
userRouter.patch("/update_bookshelf", async (req, res) => {
    const reqUsername = req.body.username;
    const userBookshelf = req.body.bookshelf;
    const userOldRate = req.body.oldRate;
    await UserModel.findOne(
        { username: reqUsername, "bookshelf.bookId": userBookshelf.bookId },
        (err, doc) => {
            if (err) return res.send(503).status("FindBookErr");
            if (doc !== null) { //book found then update it
                console.log("This is your doc: ", doc);
                UserModel.updateOne( //updateOne starts
                    {// find book by user and bookid
                        username: reqUsername,
                        bookshelf: {
                            $elemMatch: { bookId: userBookshelf.bookId },
                        },
                    },
                    { //update the bookshelf of the user
                        $set: {
                            "bookshelf.$.rate": userBookshelf.rate,
                            "bookshelf.$.status": userBookshelf.status,
                        },
                    },
                    {
                        upsert: true,
                    }
                ).then((x)=>{// updateOne "then"
                    BookModel.findOne({_id: mongoose.Types.ObjectId(bookshelf.bookId)})
                    .then((doc)=>{//findOne starts
                        BookModel.findOneAndUpdate(//findOneAndUpdate starts
                            {_id: mongoose.Types.ObjectId(bookshelf.bookId)},
                            {
                                $set: {
                                    avgRating: calculatedHelpers.editBookRate(bookAvgRate, doc.ratingCount, userOldRate, parseInt(userRate)),
                                },
                            },    
                            ).then().catch((err)=>{
                                    if(err){
                                        console.log("\nZZZZZZZZZZZZZZZZZZZZZ\n:", err)
                                        return res.send(503).status("UpdateAvgErr")
                                    }
                                })//findOneAndUpdate ends
                    }).catch((err)=>{
                        if(err){
                            console.log("\nYYYYYYYYYYYYYYYYYYYYY\n:", err)
                            return res.send(503).status("FindBookShelfErr")
                        }
                    })//findOne ends
                    }).catch((err) => {// updateOne catch ends
                        if(err){
                            console.log("\nXXXXXXXXXXXXXXXXXX\n:", err)
                            return res.send(503).status("UpdateUserErr")
                        }
                });
            }
        }
    );
});

/* Logout --> Delete User Refresh Token From DB */
userRouter.get("/logout", async (req, res) => {
    const refreshToken = req.body.refToken;
    if (refreshToken == null) return res.sendStatus(401);
    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, user) => {
            if (err) return res.sendStatus(403);
            const username = user.username;
            console.log(`Extracted Username from RefreshToken ==> ${username}`);

            const userInstance = await UserModel.findOne({
                username: username,
            }).catch((err) => {
                console.error(err);
                return res.sendStatus(503);
            });

            if (!userInstance) {
                console.error(`Admin Doesn't Exist`);
                return res.status(404).send(`Admin Doesn't Exist`);
            }

            if (
                userInstance.refreshToken != null &&
                userInstance.refreshToken === refreshToken
            ) {
                console.log(`${userInstance.refreshToken}`);
                const newAccessToken = generateAcessToken({ username: user.username });
                console.log("Access Token Updated");
                return res.json({ accessToken: newAccessToken });
            }

            console.error("User Refresh Token Is not found"); //null
            return res.status(401).send(`${username} Logged Out`);
        }
    );
});

/* User Book Shelf Info Info */
userRouter.get("/", authenticateToken, async (req, res) => {
    const username = req.user;
    const userInfo = await UserModel.findOne({ username: username }).catch(
        (err) => {
            console.error(err);
            return res.sendStatus(503);
        }
    );

    // Check of  Query String for Page Numer and Book Status then Apply Filters on the USER bookshelf
    /////////////////////////////////////////////////////////////////////////////////////////////////
    return res.json(userInfo);
});

module.exports = userRouter;
