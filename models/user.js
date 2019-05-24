const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  email:{
    type:String,
    unique:true,
    required:true
  },
  name:{
    type:String,
    required:true
  },
  verified:{
    type:Boolean,
    default:false
  },
  facebookId:String,
  hash:String,
  salt:String
});

userSchema.methods.setPassword = function(passwd){
  this.salt = crypto.randomBytes(16).toString('hex');
  this.hash = crypto.pbkdf2Sync(passwd,this.salt,1000,64,'sha1').toString('hex');
};

userSchema.methods.validPassword = function(passwd){
  const hash = crypto.pbkdf2Sync(passwd,this.salt,1000,64,'sha1').toString('hex');
  return this.hash === hash;
}

userSchema.methods.setVerified = function(isVerified){
  return this.verified = isVerified;
}

userSchema.methods.isVerified = function(){
  return this.verified;
}

module.exports = mongoose.model('User',userSchema);
