require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var helmet = require('helmet');
var chalk = require('chalk');
var { database } = require('./config/key');
var routes = require("./controllers");
var app = express();

// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(
  helmet({
    contentSecurityPolicy: false,
    formguard: false
  })
);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

mongoose
  .connect(database.uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    console.log(`${chalk.green('✓')} ${chalk.blue('MongoDB Connected!')}`)
  )
  .catch(err => console.log(err));

app.use(routes);
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
