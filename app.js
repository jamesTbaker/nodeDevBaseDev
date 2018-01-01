
/*********************************************************************
	AS NEEDED, PULL IN DOTENV MODULE TO CONFIG ENVIRONMENT
*********************************************************************/

// if PM2 didin't already set our custom environment vars
if (typeof(process.env.use) === "undefined") {
	// enable use of "dotenv" node module; this allows us to set environment vars
	var dotenv = require('dotenv');
	// configure environment
	dotenv.config({path: './.env'});
}



/*********************************************************************
	PULL IN OTHER MODULES, ROUTES
*********************************************************************/

// NODE (COMMUNITY) MODULES ---
// no path required because they're registered by Node

// enable use of "express" node module; this is our app framework, including our HTTP server
var express = require('express');
// enable use of "http" node module; this enables us to make use of the HTTP protocol
// var http = require('http');
// enable use of "https" node module; this enables us to make use of the HTTP protocol over TLS/SSL
// var https = require('https');
// enable use of "fs" node module; this enables us to perform operations on the file system
var fs = require('fs');
// enable use of "path" node module; this provides utilities for working with file and directory paths
var path = require('path');
// enable use of "bunyan" node module; this enables us to log requests to and responses from server + errors
var bunyan = require('bunyan');
// enable use of "bunyan" node module; this enables us to log requests to and responses from server + errors
var morgan = require('morgan');
// enable use of "serve-favicon" node module; this is middleware for handling favicon requests
var favicon = require('serve-favicon');
// enable use of "cookie-parser" node module; this parses cookies
var cookieParser = require('cookie-parser');
// enable use of "body-parser" node module; this parses request bodies
var bodyParser = require('body-parser');
// enable use of "node-cron" node module; this allows us to schedule tasks using full crontab syntax
var cron = require('node-cron');



// CUSTOM MODULES ---



// ROUTES ---

// use the "index" route
var indexRoute = require('./routes/index');
// use the "settings" route
var settingsRoute = require('./routes/settings');
// use the "settings" route
var healthRoute = require('./routes/health');
// use the "errors" route
var errorsRoute = require('./routes/errors');
// use the "settings" route
var errorsRoute = require('./routes/errors');


/*********************************************************************
	INSTANTIATE, CONFIG EXPRESS APP
*********************************************************************/
// configuration consists of defining express middleware, essentially custom functions that the entire app can use

// INSTANTIATION ---
var app = express();


// LOGGING ---

// (we use bunyan for recorded logs because bunyan records lots of structured data; we use morgan for logging short notifications
//		to the console)

// 1. we'll log every request to the console
// 2. we'll record three log files:
//		- allInfo		= 	all requests, moderate detail - this is the one that's most likely to be useful
//		- allDebug		= 	all requests, high detail
//		- errorsDebug	= 	errors only, high detail

// log brief notifications to the console
app.use(morgan('dev'));

// specify log directories and files
var allInfoLogDirectory = path.join(__dirname, '.log/allInfo');
var allInfoLogFile = path.join(allInfoLogDirectory, 'allInfo.log');
var allDebugLogDirectory = path.join(__dirname, '.log/allDebug');
var allDebugLogFile = path.join(allDebugLogDirectory, 'allDebug.log');
var errorsDebugLogDirectory = path.join(__dirname, '.log/errorsDebug');
var errorsDebugLogFile = path.join(errorsDebugLogDirectory, 'errorsDebug.log');
// ensure log directories exist
fs.existsSync(allInfoLogDirectory) || fs.mkdirSync(allInfoLogDirectory);
fs.existsSync(allDebugLogDirectory) || fs.mkdirSync(allDebugLogDirectory);
fs.existsSync(errorsDebugLogDirectory) || fs.mkdirSync(errorsDebugLogDirectory);
// for all requests
app.use(require('express-bunyan-logger')({
	name: 'all',
	streams: [{
		type: 'rotating-file',
		level: 'info',
		path: allInfoLogFile,
		period: '1d',	// daily rotation
		count: 21		// keep 3 weeks' back copies
	},{
		type: 'rotating-file',
		level: 'debug',
		path: allDebugLogFile,
		period: '1d',	// daily rotation
		count: 21		// keep 3 weeks' back copies
	}]
}));
// for all errors
app.use(require('express-bunyan-logger').errorLogger({
	name: 'errors',
	streams: [{
		type: 'rotating-file',
		level: 'debug',
		path: errorsDebugLogFile,
		period: '1d',	// daily rotation
		count: 21		// keep 3 weeks' back copies
	}]
}));



// VIEWS ---

// where to find views and what rendering engine to use
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



// PARSING ---

// if a request contains JSON data, parse the data and place it on the request object
app.use(bodyParser.json());
// if a request contains url encoded data, parse the data and place it on the request object
app.use(bodyParser.urlencoded({ extended: false }));
// if a request contains cookie data, parse the data and place it on the request object
app.use(cookieParser());



// SSL, LISTENING ---

app.listen(process.env.httpPort, () => console.log('Express server listening on port ' + process.env.httpPort));

/*
	// force SSL; that is, if request is not secure, redirect user to https
	app.use(function(req, res, next) {
		if (req.secure) {
			next();
		} else {
			res.redirect('https://' + req.headers.host + req.url);
		}
	});
	// get SSL key, certificate as an object
	const options = {
		"key": fs.readFileSync(process.env.sslKey),
		"cert": fs.readFileSync(process.env.sslCert)
	};
	// create a server, using Express app, that listens for insecure requests on port specified in environment vars
	http.createServer(app).listen(process.env.httpPort);
	// create an SSL-secured server, using Express app, that listens for secure requests on port 443;
	// 		print confirmation so we know it started
	https.createServer(options, app).listen(process.env.httpsPort, function () {
		console.log("SSL Express server running on port " + process.env.httpsPort);
	});
*/



// ROUTES ---

// for requests to '/', use the index route
app.use('/', indexRoute);
// for requests to '/settings', use the settings route
app.use('/settings', settingsRoute);
// for requests to '/health', use the health route
app.use('/health', healthRoute);
// for requests to '/errors', use the errors route
app.use('/errors', errorsRoute);
// for requests to '/settings', use the settings route
app.use('/errors', errorsRoute);






// STATIC LOCATIONS ---

// where to find the favicon
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
// use the express static file server; tell it from where to serve files; this serves up the response
app.use(express.static(path.join(__dirname, 'public')));



// ERRORS ---

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});
// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', { title: 'Error' });
});



// CRON ---



// PROCESS ---

// upon the event of an unhandled promise rejection
process.on('unhandledRejection', (reason, p) => {
	// show some data about unhandled rejection so that it can be found
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
});



/*********************************************************************
	EXPORT EXPRESS APP
*********************************************************************/

module.exports = app;
