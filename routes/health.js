/*********************************************************************
	PULL IN MODULES, GET EXPRESS ROUTER
*********************************************************************/

// use the "express" module; this is our app framework, including our HTTP server
const express = require('express');
// use the "health" module; this contains functions allowing us to check the system health
const health = require('../modules/health');

// pull out express's router method
const router = express.Router();



/*********************************************************************
	CONFIG EXPRESS ROUTER
*********************************************************************/

//--------  BACKEND  ------------------------------------------------//

//--------  GET (READ)

// GET /
// for GET request for /
router.get('/', function(req, res, next) {
	// get a promise to retrieve health status data
	health.ReturnHealth()
	// if the promise is resolved with the docs, then respond with the docs as JSON
	.then(function(result) { res.json(result) })
	// if the promise is rejected with an error, then respond with the error as JSON
	.catch(function (error) { res.json(error) });
});



/*********************************************************************
	EXPORT EXPRESS ROUTER
*********************************************************************/

module.exports = router;