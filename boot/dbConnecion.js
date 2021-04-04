const mongoose = require('mongoose')
const uri = "mongodb+srv://team7-ninjas:123intake41@goodbookscluster.mrby6.mongodb.net/awesome-reads?retryWrites=true&w=majority"
mongoose.connect(uri, 
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true},
  err => {
    if(err) console.error(err)
    else console.log("Connected To Atlas Datebase")
  }
)


// URL = "mongodb+srv://team7-ninjas:123intake41@goodbookscluster.mrby6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://team7-ninjas:123intake41@goodbookscluster.mrby6.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//   const collection = client.db("test").collection("devices");
//   // perform actions on the collection object
//   client.close();
// });



