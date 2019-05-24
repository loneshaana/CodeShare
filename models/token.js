const mongoose = require('mongoose');
const crypto = require('crypto');


const TokenSchema = new mongoose.Schema({
  email:{
    type:String,
    unique:true,
    required:true
  },
  tokenString:{
    type:String,
    required:true
  },
  expires:{
    type:String,
    required:true
  }
})

module.exports = mongoose.model('Token',TokenSchema);
