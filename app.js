
// ----- AS NEEDED, PULL IN DOTENV MODULE TO CONFIG ENVIRONMENT

// if our custom environment vars aren't set, set them
if (typeof (process.env.use) === 'undefined') {
	const dotenv = require('dotenv'); // eslint-disable-line global-require
	dotenv.config({ path: './.env' });
}


// ----- PULL IN OTHER MODULES, ROUTES

// NODE (COMMUNITY) MODULES ---

const express = require('express');
// const http = require('http');
// const https = require('https');
const fs = require('fs');
const path = require('path');
const bunyan = require('express-bunyan-logger');
const morgan = require('morgan');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
// const cron = require('node-cron');


// CUSTOM MODULES ---

// ROUTES ---

const indexRoute = require('./routes/index');
const settingsRoute = require('./routes/settings');
const healthRoute = require('./routes/health');
const errorsRoute = require('./routes/errors');


// ----- INSTANTIATE, CONFIG EXPRESS APP

// INSTANTIATION ---
const app = express();


// LOGGING ---

/** (we use bunyan for recorded logs because bunyan records lots of structured data; 
 *   we use morgan for logging short notifications to the console)
 *
 * 1. we'll log every request to the console
 * 2. we'll record three log files:
 * 		- allInfo		= 	all requests, moderate detail - this is the one that's most likely
 * 							to be useful
 * 		- allDebug		= 	all requests, high detail
 * 		- errorsDebug	= 	errors only, high detail
*/

// log brief notifications to the console
app.use(morgan('dev'));

// specify log directories and files
const allInfoLogDirectory = path.join(__dirname, '.log/allInfo');
const allInfoLogFile = path.join(allInfoLogDirectory, 'allInfo.log');
const allDebugLogDirectory = path.join(__dirname, '.log/allDebug');
const allDebugLogFile = path.join(allDebugLogDirectory, 'allDebug.log');
const errorsDebugLogDirectory = path.join(__dirname, '.log/errorsDebug');
const errorsDebugLogFile = path.join(errorsDebugLogDirectory, 'errorsDebug.log');
// ensure log directories exist
if (!(fs.existsSync(allInfoLogDirectory))) { fs.mkdirSync(allInfoLogDirectory); }
if (!(fs.existsSync(allDebugLogDirectory))) { fs.mkdirSync(allDebugLogDirectory); }
if (!(fs.existsSync(errorsDebugLogDirectory))) { fs.mkdirSync(errorsDebugLogDirectory); }
// for all requests
app.use(require('express-bunyan-logger')({
	name: 'all',
	streams: [{
		type: 'rotating-file',
		level: 'info',
		path: allInfoLogFile,
		period: '1d',	// daily rotation
		count: 21,		// keep 3 weeks' back copies
	}, {
		type: 'rotating-file',
		level: 'debug',
		path: allDebugLogFile,
		period: '1d',	// daily rotation
		count: 21,		// keep 3 weeks' back copies
	}],
}));
// for all errors
app.use(bunyan.errorLogger({
	name: 'errors',
	streams: [{
		type: 'rotating-file',
		level: 'debug',
		path: errorsDebugLogFile,
		period: '1d',	// daily rotation
		count: 21,		// keep 3 weeks' back copies
	}],
}));


// VIEWS ---

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


// PARSING ---

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// SSL, LISTENING ---

app.listen(process.env.httpPort, () => console.log(`Listening on port ${process.env.httpPort}`)); // eslint-disable-line no-console

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
	// create a server, using Express app, that listens for insecure requests on 
	// port specified in environment vars
	http.createServer(app).listen(process.env.httpPort);
	// create an SSL-secured server, using Express app, that listens for secure requests on 
	// 		port 443; print confirmation so we know it started
	https.createServer(options, app).listen(process.env.httpsPort, function () {
		console.log("SSL Express server running on port " + process.env.httpsPort);
	});
*/


// ROUTES ---

app.use('/', indexRoute);
app.use('/settings', settingsRoute);
app.use('/health', healthRoute);
app.use('/errors', errorsRoute);


// STATIC LOCATIONS ---

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(path.join(__dirname, 'public')));


// ERRORS ---

// catch 404 and forward to error handler
app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});
// error handler
app.use((err, req, res, next) => {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error', { title: 'Error' });
});


// CRON ---


// PROCESS ---

process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at: Promise', p, 'reason:', reason); // eslint-disable-line no-console
});


// ----- EXPORT EXPRESS APP

module.exports = app;
