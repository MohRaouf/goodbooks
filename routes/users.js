const express = require("express");
const userRouter = express.Router();
const UserModel = require("../models/user");
const authenticateToken = require("../helpers/methods");
const calculated= require("../helpers/calculated");
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

userRouter.delete("/remove_book", async (req, res) => {
    const reqUsername = req.body.username;
    const book = req.body.bookId;
    const userRate = req.body.userRate;
    const bookAvgRate = req.body.avgRate;
    await UserModel.findOneAndUpdate(
        { username: reqUsername, "bookshelf.bookId": book },
        {
            $pull: { bookshelf: { bookId: book } },
        },
    ).then((userDoc) => { //findOneAndUpdate starts
        console.log("BookId:", book)
        console.log("UserId:", userDoc._id)
        if(userDoc){
            ReviewModel.findOneAndDelete({
                userId: mongoose.Types.ObjectId(userDoc._id),
                bookId: mongoose.Types.ObjectId(book)
            },).then((reviewDocs)=>{
                console.log("review:", reviewDocs)
                BookModel.findOne({reviews: mongoose.Types.ObjectId(reviewDocs._id)}).then((reviewDoc)=>{
                    console.log("book:", reviewDoc)
                    console.log("book Id:", reviewDoc._id)
                    console.log("Rating count:", reviewDoc.ratingCount)
                    BookModel.findOneAndUpdate({ reviews: mongoose.Types.ObjectId(reviewDocs._id) },
                        {
                            $pull: { reviews: mongoose.Types.ObjectId(reviewDocs._id) },
                            $set:{
                                avgRating: calculated.deleteRateFromBook(bookAvgRate, reviewDoc.ratingCount, parseInt(userRate)),
                            },
                            $inc: { ratingCount: reviewDoc.ratingCount>0?-1:0},
                        },
                        ).then((bookDoc)=>{
                            console.log("Updated Book info:", bookDoc)
                            res.sendStatus(200)
                        }).catch()
                }).catch()
            }).catch()
        } 
    })
    .catch((err) => { //findOneAndUpdate ends
        console.log("\n---------------------------\nNo User found:\n---------------------------\n", err)
        res.sendStatus(404)
    })
})



// edit bookshelf
userRouter.patch("/update_bookshelf", async (req, res) => {
    const reqUsername = req.body.username;
    const userBookshelf = req.body.bookshelf;
    const userOldRate = req.body.oldRate;
    await UserModel.findOne(
        { username: reqUsername, "bookshelf.bookId": userBookshelf.bookId },
        (err, doc) => {
            if (err) return res.send(err);
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
                ).then((_)=>{// updateOne "then"
                    BookModel.findOne({_id: mongoose.Types.ObjectId(bookshelf.bookId)})
                    .then((doc)=>{//findOne starts
                        BookModel.findOneAndUpdate(//findOneAndUpdate starts
                            {_id: mongoose.Types.ObjectId(bookshelf.bookId)},
                            {
                                $set: {
                                    avgRating: calculated.editBookRate(bookAvgRate, doc.ratingCount, userOldRate, parseInt(userRate)),
                                },
                            },    
                            ).then().catch()//findOneAndUpdate ends
                    }).catch(()=>{})//findOne ends
                    }).catch((err) => {// updateOne catch ends
                    if (err)
                        console.error(err);
                    return res.sendStatus(503);
                });
            }
        }
    );
});

// assert book
userRouter.patch("/assert_bookshelf", async (req, res) => {
    const reqUsername = req.body.username;
    const userBookshelf = req.body.bookshelf;
    const userOldRate = req.body.oldRate;
    // const userStatus = req.body.userStatus;

    await UserModel.findOne(
        { username: reqUsername, "bookshelf.bookId": userBookshelf.bookId },
        (err, doc) => {
            if (err) return res.send(err);
            if (doc !== null) { //book found then update it
                console.log("This is your doc: ", doc);
                UserModel.updateOne(
                    {
                        username: reqUsername,
                        bookshelf: {
                            $elemMatch: {
                                bookId: userBookshelf.bookId,
                            },
                        },
                    },
                    {
                        $set: {
                            "bookshelf.$.rate": userBookshelf.rate,
                            "bookshelf.$.status": userBookshelf.status,
                        },
                    },
                    {
                        upsert: true,
                    }
                ).then((_)=>{// updateOne
                    BookModel.findOne({_id: mongoose.Types.ObjectId(bookshelf.bookId)})
                    .then((doc)=>{
                        BookModel.findOneAndUpdate(
                            {_id: mongoose.Types.ObjectId(bookshelf.bookId)},
                            {
                                $set: {
                                    avgRating: calculated.editBookRate(bookAvgRate, doc.ratingCount, userOldRate, parseInt(userRate)),
                                },
                            },    
                            ).then().catch()//findOneAndUpdate
                    }).catch(()=>{})//findOne
                    }).catch((err) => {// updateOne
                    if (err)
                        console.error(err);
                    return res.sendStatus(503);
                });
                return res.sendStatus(200);
            } else { //book not found then add it  it
                UserModel.updateOne( // add new book entirely
                    { username: reqUsername },
                    { 
                        $push: { bookshelf: userBookshelf },
                    }
                ).then((doc)=>{
                    if(doc.nModified == 1)
                        BookModel.find({},{$inc: { ratingCount: 1},}).then(res.sendStatus(200)).catch(res.sendStatus(404))
                }).catch((err) => {
                    if (err) return res.sendStatus(503);
                });
                return res.sendStatus(200);
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
