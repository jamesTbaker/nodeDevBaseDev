
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const express = require('express');
const health = require('../modules/health');

const router = express.Router();

// ----- CONFIG EXPRESS ROUTER

// GET ---

router.get('/', (req, res, next) => {
	health.ReturnHealth()
		.then((result) => { res.json(result); })
		.catch((error) => { res.json(error); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
