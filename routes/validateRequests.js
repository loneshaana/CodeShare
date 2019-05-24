const validate = {};

validate.validateRegistration = (req) =>{
  req.checkBody('name' , "Empty Name").notEmpty();
  req.checkBody('email' , "Invalid Email").isEmail();
  req.checkBody('password' , "Empty password").notEmpty();
  req.checkBody('password' , "Password do not match").equals(req.body.confirmPassword).notEmpty();
  return req.validationErrors();
}

validate.verifyAccount = (req,tokenString) =>{
  req.checkBody('verificationCode',"token is invalid, please try again").notEmpty();
  req.checkBody('verificationCode',"token is invalid, please try again").equals(tokenString);
  return req.validationErrors();
}

module.exports = validate;
