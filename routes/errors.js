
/*********************************************************************
	PULL IN MODULES, GET EXPRESS ROUTER
*********************************************************************/

// use the "express" node module; this is our app framework, including our HTTP server
const express = require('express');
// use the "errors" module; this allows us to record errors
const errors = require('../modules/errors');

// pull out express's router method
const router = express.Router();



/*********************************************************************
	CONFIG EXPRESS ROUTER
*********************************************************************/

//--------  BACKEND  ------------------------------------------------//

//--------  POST (CREATE)

// POST /process
// for POST requests for /process
router.post('/process', function (req, res) {
	// get a promise to insert the error (request body) into the queue
	errors.ProcessError(req.body)
	// if the promise is resolved with the result, then respond with the result as JSON
	.then(function (result) { res.json(result) })
	// if the promise is rejected with an error, then respond with the error as JSON
	.catch(function (error) { res.json(error) });
});



//--------  CONSOLE / DOCUUMENTATION  -------------------------------//

// GET /admin
// for GET requests for /admin
/*router.get('/admin', function(req, res) {
	// respond with a render of the errors/adminConsole view
	res.render('settings/adminConsole', { title: 'Settings Admin Console' });
});*/



/*********************************************************************
	EXPORT EXPRESS ROUTER
*********************************************************************/

module.exports = router;