var appzip = require('appmetrics-zipkin')({
  host: 'jaeger-collector.jaeger.svc.cluster.local',
  port: 9411,
  serviceName: 'nodeserver'
});
var prom = require('appmetrics-prometheus').attach()
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const health = require('@cloudnative/health-connect');
let healthcheck = new health.HealthChecker();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

let pingCheck = new health.PingCheck("example.com");
healthcheck.registerReadinessCheck(pingCheck);

app.use('/live', health.LivenessEndpoint(healthcheck));
app.use('/ready', health.ReadinessEndpoint(healthcheck))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
