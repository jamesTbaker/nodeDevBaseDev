
// ----- PULL IN EXPRESS, GET EXPRESS ROUTER

const express = require('express');

const router = express.Router();

// ----- CONFIG EXPRESS ROUTER

// GET ---
router.get('/', (req, res, next) => {
	res.render('index', { title: 'Index' });
});

// ----- EXPORT EXPRESS ROUTER

module.exports = router;
