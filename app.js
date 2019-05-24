const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
require('./passport');

const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const expressValidator = require('express-validator');
const config = require('./config');

mongoose.connect(config.dbConnString);
global.User = require('./models/user'); // globally Accessiable
global.Token = require('./models/token');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(expressValidator());

app.use(cookieParser());
app.use(session({
  secret:config.sessionKey,
  resave:false,
  saveUnitialized:false,
  // cookie:{secure:true}
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

//Store sessions
app.use( (req,res,next) =>{
  if(req.isAuthenticated()){
    res.locals.user = req.user;
  }
  next();
});

app.use('/', indexRouter);
app.use('/', authRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
