
// ----- PULL IN MODULES

const dbQueries = require('./dbQueries');

// ----- DEFINE SETTINGS FUNCTIONS

module.exports = {

	ReturnSettings: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the settings document collection
			dbQueries.ReturnAllDocsFromCollection('settings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((settings) => { resolve(settings); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnHealthSettings: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the settings document collection
			dbQueries.ReturnAllDocsFromCollection('settings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((settings) => {
					resolve({ error: settings.error, health: settings.docs[0].health });
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),

	ReturnTumblrSettings: () =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to retrieve all documents from the settings document collection
			dbQueries.ReturnAllDocsFromCollection('settings')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then((settings) => {
					resolve({ error: settings.error, tumblr: settings.docs[0].tumblr });
				})
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		})),
};
