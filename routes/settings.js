
// ----- PULL IN MODULES, GET EXPRESS ROUTER

const express = require('express');
const settings = require('../modules/settings');

const router = express.Router();

// ----- CONFIG EXPRESS ROUTER

// GET ---

router.get('/', (req, res, next) => {
	settings.ReturnSettings()
		.then((result) => { res.json(result); })
		.catch((error) => { res.json(error); });
});

router.get('/health', (req, res, next) => {
	settings.ReturnHealthSettings()
		.then((result) => { res.json(result); })
		.catch((error) => { res.json(error); });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
