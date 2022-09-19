const mongoose = require("../lib/connection");
const { Schema } = require('mongoose');
 
// create an schema
var userSchema = new Schema({
            name: String,
            email:String
        });
 
var userModel=mongoose.model('Users',userSchema);
 
module.exports = userModel;