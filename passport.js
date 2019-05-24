const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const facebookStrategy = require('passport-facebook').Strategy;

passport.serializeUser( (user,done) =>{
  done(null,user._id);
});

passport.deserializeUser( (id,done) =>{
  User.findOne({_id:id},(err,user) =>{
    done(err,user);
  })
})

passport.use(new localStrategy({
  usernameField:'email',
},
function(username,password,done){
  User.findOne({email:username}, (err,user) =>{
    if(err)return done(err);
    if(!user) return done(null,false,{
      message:"Incorrect username or password"
    });
    if(!user.validPassword(password)){
      return done(null,false,{message:"Incorrect username or password"});
    }
    if(!user.isVerified()){
      return done(null,false,{message:'user is not verified, please verify first'});
    }
    return done(null,user);
  })
}));

passport.use(new facebookStrategy({
  clientID:'342954746353523',
  clientSecret:'16eb98a27df8c89006990ac92d7e457b',
  callbackURL:'http://localhost:3000/auth/facebook/callback',
  profileFields:['id','displayName','email']
}, (token,refreshToken,profile,done) =>{
  User.findOne({facebookId:profile.id} , (err,user) =>{
    if(err) return done(err);
    if(user) return done(null,user);
    else {
      User.findOne({email:profile.emails[0].value} , (err,user) =>{
        if(user){
          user.facebookId = profile.id;
          return user.save( (err) =>{
            if(err) return done(null,false,{"message":"unable to save the user"});
            return done(null,user);
          })
        }
        let userToCreate = new User();
        userToCreate.name = profile.displayName;
        userToCreate.email = profile.emails[0].value;
        userToCreate.facebookId = profile.id;
        userToCreate.save( (err,userCreated) =>{
          if(err) return done(null,false,{"message":"unable to save the user"});
          return done(null,userToCreate);
        })
      })
    }
  })
}));
