
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const express = require('express');
const errors = require('../modules/errors');

const router = express.Router();

// ----- CONFIG EXPRESS ROUTER

// POST ---

router.post('/process', (req, res) => {
	errors.ProcessError(req.body)
		.then((result) => { res.json(result); })
		.catch((error) => { res.json(error); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
