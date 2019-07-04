var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
var monk = require('monk');
var db = monk('localhost:27017/notice_board');

var session=require('express-session');
var crypto = require("crypto");
var passport=require('passport');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var id = crypto.randomBytes(20).toString('hex');
app.use(session({                   //creates a cookie folder named localhost:3000
  secret: id,                       //similar to SALT property.Used for hashing cookies
  resave: false,                    //false:- updates session only when a change is directly made to it. true:-updates session automatiacally,even in no change
  saveUninitialized: false,         //false:- creates a cookie only when user logs in
//  cookie: { secure: true }        //used for https services
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(require('flash')());


// Make our db accessible to our router
app.use(function(req,res,next){
  req.db = db;
  next();
});


app.use('/', indexRouter);
app.use('/users', usersRouter);

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
