// Requiring Mongoose for communicate with mongodb data
const mongoose = require('mongoose')
//creating admin schema 

//crypto for passord [not finished]
const admin_schema = new mongoose.Schema({
    
    // admin_fname:    { type : String, minimumLength : 3, required : true },
    // admin_lname:    { type : String, minimumLength : 3, required : true },
    admin_user_name : { type : String, minimumLength : 6, required : true },
    admin_password: { type : String, minimumLength : 8, required : true, hide : true },
})

//creating a model for the admin 
//admin has privilages >> adding another admin 
const admin_model = mongoose.model('admin',admin_schema)
//exporting admin model 
module.exports = admin_model