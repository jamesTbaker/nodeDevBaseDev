
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// use the "dbQueries" module; this allows us to use some standardized and convenient query methods
const dbQueries = require('./dbQueries');



/*********************************************************************
	DEFINE SETTINGS FUNCTIONS
*********************************************************************/

module.exports = {

	"ReturnSettings": () => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// get a promise to retrieve all documents from the settings document collection
			dbQueries.ReturnAllDocsFromCollection("settings")
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function (settings) { resolve(settings) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	},

	"ReturnHealthSettings": () => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// get a promise to retrieve all documents from the settings document collection
			dbQueries.ReturnAllDocsFromCollection("settings")
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function (settings) { resolve({ "error": settings.error, "health": settings["docs"][0]["health"] }) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	}
};