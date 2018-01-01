
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// use the "dbQueries" module; this allows us to use some standardized and convenient query methods
const dbQueries = require('./dbQueries');
// use the "utilities" neso module; this allows us to use some date and time functions
const utilities = require('./utilities');



/*********************************************************************
	DEFINE EMAIL FUNCTIONS
*********************************************************************/

module.exports = {

	"ReturnHealthFromDB": () => {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the health document collection
			dbQueries.ReturnAllDocsFromCollection('health')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	},

	// keep health separate from db health in anticipation that other types of health may need checking
	"ReturnHealth": () => {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the health document collection
			module.exports.ReturnHealthFromDB()
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	}
};