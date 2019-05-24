const express = require('express');
const router = express.Router();
const nodeMailer = require('nodemailer');
const helpers = require('../helpers');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/about' , (req,res,next) =>{
  res.render('about',{title:'Code4Share - a platform for sharing code'});
});

router.route('/contact')
  .get((req,res,next) =>{
    res.render('contact',{title:'Code4Share - a platform for sharing code'});
  })
  .post( (req,res,next) =>{
    /*
      Validate the data first
    */
    req.checkBody('name','Empty name').notEmpty();
    req.checkBody('email','Invalid email').isEmail();
    req.checkBody('message','Empty Message').notEmpty();
    let errors = req.validationErrors();
    if(errors){
      res.render('contact',{
        title:'Code4Share - a platform for sharing code',
        name:req.body.name,
        email:req.body.email,
        message:req.body.message,
        errorMessages:errors
      });
    }else{
      // send the mail.
      return helpers.sendMail('ulhaq2997@gmail.com','You got the new message',req.body.message,() =>{
        res.render('thank',{title:'Code4Share - a platform for sharing code'});
      });
    }
  })

module.exports = router;
