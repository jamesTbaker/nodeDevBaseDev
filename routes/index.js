/*********************************************************************
	PULL IN EXPRESS, GET EXPRESS ROUTER
*********************************************************************/

// use the "express" node module; this is our app framework, including our HTTP server
const express = require('express');

// pull out express's router method
const router = express.Router();



/*********************************************************************
	CONFIG EXPRESS ROUTER
*********************************************************************/

// for GET request for top level directory, tell router to...
router.get('/', function(req, res, next) {
	// set the response to a render of the index view (with options)
	res.render('index', { title: 'Index' });
});



/*********************************************************************
	EXPORT EXPRESS ROUTER
*********************************************************************/

module.exports = router;