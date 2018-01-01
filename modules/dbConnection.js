
/*********************************************************************
	PULL IN MODULE
*********************************************************************/

// enable use of "monk" node module; this provides "simple yet substantial usability improvements for MongoDB usage within Node.JS"
const monk = require('monk');



/*********************************************************************
	GET DB CONNECTION
*********************************************************************/

const dbConnection = monk(process.env.dbUser + ":" + process.env.dbPass + "@" + process.env.dbHost + ":" + process.env.dbPort + "/" + process.env.dbName);



/*********************************************************************
	EXPORT DB CONNECTION
*********************************************************************/

module.exports = dbConnection;