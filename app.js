var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var passport = require('passport');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();
var env = process.env.NODE_ENV || 'development';

// view engine setup
app.set('views', path.join(__dirname, '/app/views'));
app.set('view engine', 'ejs');
app.use(function (req, res, next) {
  res.removeHeader('x-powered-by');
  next();
});
app.use(express.static(path.join(__dirname, 'public')));

var routes = require('./app/routes/index'),
  mongoose = require('mongoose'),
  config = require('./config'),
  db = require('./mongoose')(env);

// Routes
var authRoutes = require('./app/routes/auth'),
  websiteRoutes = require('./app/routes/website'),
  accountRoutes = require('./app/routes/account'),
  paymentRoutes = require('./app/routes/payment'),
  adminRoutes = require('./app/routes/admin');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
  resave: true,
  saveUninitialized: false,
  secret: config.session_secret,
  store: new MongoStore({ mongooseConnection: mongoose.connection, clear_interval: 3600 }),
  cookie: {
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
}));
app.use(flash());
require('./app/config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes);
app.use('/auth', authRoutes);
app.use('/website', websiteRoutes);
app.use('/account', accountRoutes);
app.use('/payment', paymentRoutes);
app.use('/admin', adminRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (env === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);

    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);

  if (err.type === "json") {
    res.json({
      message: err.message,
      code: err.status || 500
    });
  } else {
    res.render('error', {
      message: err.message,
      error: {}
    });
  }
});


module.exports = app;
