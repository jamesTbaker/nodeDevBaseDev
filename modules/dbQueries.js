
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// use the "dbConnection" module; this is sufficient to bring in the database connection
const dbConnection = require('./dbConnection');
// use the "errors" module; this allows us to record errors
const errors = require('../modules/errors');


/*********************************************************************
	DB QUERY WRAPPER FUNCTIONS
*********************************************************************/

module.exports = {

	"ReturnAllDocsFromCollection": (collection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).find({}, {}, function (error, docs) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						"error": false,
						"mongoDBError": false,
						"docs": docs
					});
				}
			});
		});
	},

	"ReturnAllSpecifiedDocsFromCollection": (collection, query, projection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).find(query, projection, function (error, docs) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						"error": false,
						"mongoDBError": false,
						"docs": docs
					});
				}
			});
		});
	},

	"ReturnFirstDocFromCollection": (collection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).findOne({}, {}, function (error, docs) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						"error": false,
						"mongoDBError": false,
						"docs": docs
					});
				}
			});
		});
	},

	"ReturnOneSpecifiedDocFromCollection": (collection, query, projection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).findOne(query, projection, function (error, docs) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						"error": false,
						"mongoDBError": false,
						"docs": docs
					});
				}
			});
		});
	},

	"ReturnOneRandomSampleFromSpecifiedDocsFromCollection": (collection, query) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).aggregate([{ '$match': query }, { '$sample': { 'size': 1 } } ], function (error, docs) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the docs
					resolve({
						"error": false,
						"mongoDBError": false,
						"docs": docs
					});
				}
			});
		});
	},

	"InsertDocIntoCollection": (doc, collection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).insert(doc, function (error, result) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the result
					resolve({
						"error": false,
						"mongoDBError": false,
						"docs": result
					});
				}
			});
		});
	},

	"OverwriteDocInCollection": (docID, doc, collection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).update({ '_id': docID }, doc, function (error, countsFromMonk) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the counts of what happened (with more meaningful labels)
					let docCounts = {};
					if (typeof (countsFromMonk.n) !== "undefined") { docCounts.matchedDocs = countsFromMonk.n; }
					if (typeof (countsFromMonk.nModified) !== "undefined") { docCounts.modifiedDocs = countsFromMonk.nModified; }
					resolve({
						"error": false,
						"mongoDBError": false,
						"docCounts": docCounts
					});
				}
			});
		});
	},

	"DeleteDocFromCollection": (docID, collection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).remove({ '_id': docID }, function (error, resultFromMonk) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the counts of what happened (with more meaningful labels)
					const docCounts = {};
					if (typeof (resultFromMonk.result.n) !== "undefined") { docCounts.matchedDocs = resultFromMonk.result.n; }
					if (typeof (resultFromMonk.result.ok) !== "undefined") { docCounts.deletedDocs = resultFromMonk.result.ok; }
					resolve({
						"error": false,
						"mongoDBError": false,
						"docCounts": docCounts
					});
				}
			});
		});
	},

	"DeleteAllDocsFromCollection": (collection) => {
		// return a new promise
		return new Promise(function (resolve, reject) {
			// using the dbConnection object, get the specified collection from the db; that is, use the db connection
			//      to fill the docs var with db documents; use find method with empty query and options
			//      objects to select all docs and invoke callback
			dbConnection.get(collection).remove({}, function (error, resultFromMonk) {
				// if there was an error
				if (error) {
					// construct a custom error
					const errorToReport = {
						"error": true,
						"mongoDBError": true,
						"mongoDBErrorDetails": error
					};
					// add error to Twitter
					errors.ProcessError(errorToReport);
					// reject this promise with the error
					reject(errorToReport);
					// if there was NOT an error
				} else {
					// resolve the promise and return the counts of what happened (with more meaningful labels)
					let docCounts = {};
					if (typeof (resultFromMonk.result.n) !== "undefined") { docCounts.matchedDocs = resultFromMonk.result.n; }
					if (typeof (resultFromMonk.result.ok) !== "undefined") { docCounts.deletedDocs = resultFromMonk.result.ok; }
					resolve({
						"error": false,
						"mongoDBError": false,
						"docCounts": docCounts
					});
				}
			});
		});
	}
};