const express = require('express');
const router = express.Router();
// const User = require('../models/user');
const passport = require('passport');
const helpers = require('../helpers');
const validate = require('./validateRequests');

router.route('/login')
.get((req,res,next) =>{
  if(!req.isAuthenticated())
    res.render('login',{title:'Login with your credentials'});
  else
    res.redirect('/');
}).post( passport.authenticate('local',{
  failureRedirect:'/login',
  successRedirect:'/',
  failureFlash: true
}));

router.get('/logout', (req, res) =>{
  req.logout();
  res.redirect('/');
});

router.post('/verifyAccount' , (req,res,next) =>{
    // validate the data
    let errors = validate.verifyAccount(req,null);
    if(errors){
      res.render('confirmRegistration',{
        errorMessages:errors,
        email:req.body.email
      });
    }else{
      // validate the token
      Token.findOne({email:req.body.email} , (err,tokenData) =>{
        errors = validate.verifyAccount(req,tokenData.tokenString);
        
        if(!err){
          if(req.body.verificationCode === tokenData.tokenString){
            const currentDate = Date.now();
            if(currentDate > tokenData.expires){
              // token is expired
              res.render('confirmRegistration',{
                email:req.body.email,
                errorMessages:errors,
                tokenExpired:true,
                expireMessage:req.flash('Token is expired please generate the new one,<a>Generate new one</a>')
              });
            }
            // successfully validated user;
            else{
              User.findOne({email:req.body.email} , (err,user) =>{
                user.setVerified(true);
                user.save( (err,userdata) =>{
                  if(!err){
                    res.redirect('/login');
                  }
                });
              });
            }
          }else{
            res.render('confirmRegistration',{
              errorMessages:errors,
              email:req.body.email
            });
          }
        }else{
          res.render('confirmRegistration',{
            errorMessages:errors,
            email:req.body.email
          });
        }
      });
    }
});


router.route('/register')
  .get((req,res,next) =>{
    res.render('register',{title:'Register A New Account'});
  })
  .post( (req,res,next) =>{
    const errors = validate.validateRegistration(req);
    if(errors){
      res.render("register",{
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        errorMessages:errors
      });
    }else{
      // generate the token
      const tokenToValidate = helpers.generateToken();

      // create the token and save the token
      helpers.configureToken(req.body.email,true); // associate email with token

      // create the user
      const user = helpers.constructUser(req);

      // save the user and send Mail
      helpers.saveUser(user,tokenToValidate,res, (whatToReturn) =>{
        return whatToReturn;
      });
    }
  })

router.get('/auth/facebook' , passport.authenticate('facebook',{scope:'email'}));
router.get('/auth/facebook/callback',passport.authenticate('facebook',{
  successRedirect:'/',
  failureRedirect:'/'
}));

module.exports = router;
