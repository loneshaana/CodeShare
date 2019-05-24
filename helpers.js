const nodeMailer = require('nodemailer');
const config = require('./config');
const transporter = nodeMailer.createTransport(config.mailer);

const helpers = {};

//@TODO Need a good algorithm to geneerate the strong token and un-predictable token. use Time Based One Time Passwords (TOTP),
helpers.generateToken = () =>{
  let possibleTokens = "abcdefghijklmnopqrstuvwxyz0123456789"+"abcdefghijklmnopqrstuvwxyz".toUpperCase();
  const tokenLen = 6;
  let token = '';
  for(let i=1;i<=tokenLen;i++){
    let randomChar = possibleTokens.charAt(Math.floor(Math.random()*possibleTokens.length));
    token += randomChar;
  }
  return token;
}

helpers.sendMail = (to,subject,message,callback) =>{
  const mailOptions = {
    from:config.mailer.auth.user,
    to:to,
    subject:subject,
    text:message
  };
  transporter.sendMail(mailOptions,(err,info) =>{
    if(err){
      return console.log(err);
    }else{
      callback();
    }
  });
}

helpers.constructUser = (req) =>{
  const user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.setPassword(req.body.password);
  return user;
}

helpers.saveUser = (user,tokenToValidate,res,callback) =>{
  user.save( (err) =>{
    if(err){
      return callback(res.render('register',{
        errorMessage:err,
      }));
    }else{
      helpers.sendMail(user.email,'verify code4share account',
        `your code for verification is ${tokenToValidate}`, () =>{
          return callback(res.render('confirmRegistration',{
            email:user.email,
            message:"An email has been sent to your mailbox, please validate your account"
          }));
        });
    }
  });
}

helpers.saveToken = (token) =>{
  token.save( (err,tokenData) =>{
    if(err){
      console.warn("Error while saving token ",err);
    }
  })
}

helpers.configureToken = (email,save) =>{
  const token = new Token();
  token.email = email;
  token.tokenString = helpers.generateToken();
  token.expires = Date.now()  + 1000 * 60 * 5; // expires in 5mins;
  if(save){
    helpers.saveToken(token);
  }
  return token;
}
module.exports = helpers;
