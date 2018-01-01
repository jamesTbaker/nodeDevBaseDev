
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// enable use of "fs" node module; this enables us to perform operations on the file system
var fs = require('fs');
// enable use of "xlsx" node module; this provides "simple yet substantial usability improvements for MongoDB usage within Node.JS"
var excel = require('node-xlsx').default;

// use the "nesoDBConnection" neso module; this is sufficient to bring in the database connection
var nesoDBConnection = require('./nesoDBConnection');
// use the "nesoDBQueries" neso module; this allows us to use some standardized and convenient query methods
var nesoDBQueries = require('./nesoDBQueries');
// use the "nesoUtilities" neso module; this allows us to use some generic utility functions
var nesoUtilities = require('./nesoUtilities');
// use the "nesoErrors" neso module; this allows us to do stuff with error
var nesoErrors = require('./nesoErrors');



/*********************************************************************
	DEFINE ERROR FUNCTIONS
*********************************************************************/

var nesoHRPositions = function() {

	var ReturnHRPositionsSettings = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('hrPositionsSettings')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnHRPositionsDataProcessingStatus = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnHRPositionsSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "dataProcessingStatus": settings["docs"][0]["dataProcessingStatus"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnHRPositionsDataProcessingNow = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnHRPositionsSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "dataProcessingNow": settings["docs"][0]["dataProcessingNow"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnHRPositionsExcelSettings = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnHRPositionsSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "excel": settings["docs"][0]["excelOptions"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnHRPositionsWhitelistedDomains = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnHRPositionsSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "whitelistedDomains": settings["docs"][0]["whitelistedDomains"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error)});
		});
	};

	var ReplaceAllHRPositionsSettings = function(newSettings) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnHRPositionsSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(existingSettings) { 
				// get a promise to replace the settings in the emailSettings document collection
				nesoDBQueries.OverwriteDocInCollection(existingSettings["docs"][0]["_id"], newSettings, 'hrPositionsSettings')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then(function(result) { resolve(result) })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch(function (error) {reject(error) })
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReplaceOneHRPositionsSetting = function(newSingleSettingObject) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnHRPositionsSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(existingSettings) { 
				// get a new version of all settings
				var newSettings = existingSettings["docs"][0];
				// get an array containing the property key of newSingleSettingObject; iterate over the array
				Object.keys(newSingleSettingObject).forEach(function(newSingleSettingKey) {
					// in the new settings, replace the relevant setting with the value passed to this function
					newSettings[newSingleSettingKey] = newSingleSettingObject[newSingleSettingKey];
				});
				// get a promise to replace the settings in the emailSettings document collection
				nesoDBQueries.OverwriteDocInCollection(existingSettings["docs"][0]["_id"], newSettings, 'hrPositionsSettings')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then(function(result) { resolve(result) })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch(function (error) {reject(error) })
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnAllHRPositionsFromExcel = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve excel settings
			ReturnHRPositionsExcelSettings()
			// if the promise to retrieve excel settings is resolved with the settings
			.then(function(settings) {
				// try to resolve this promise with the hr positions data
				try {
					// set up empty array to be used if no data is in the designated worksheet, or said worksheet does not exist
					var hrPositions = [];
					// get data from all of the worksheet
					var allWorksheets = excel.parse(fs.readFileSync(settings.excel.filePathAndName));
					// iterate over the worksheets
					for (const worksheet of allWorksheets) {
						// if the name of this worksheet matches the designated worksheet
						if (worksheet.name == settings.excel.positionsWorksheetName) {
							// replace hrPositions with the data from this worksheet
							hrPositions = worksheet.data;
						}
					}
					// resolve this promise with a message
					resolve({
						"error": false,
						"excelError": false,
						"hrPositions": hrPositions
					});
				// if there was an error
				} catch (exception) {
					// construct a custom error
					var errorToReport = {
						"error": true,
						"excelError": true
					};
					// process error
					nesoErrors.ProcessError(errorToReport);
					// reject this promise with an error
					reject(errorToReport);
				}
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var DeleteAllHRPositionsaFromDatabase = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.DeleteAllDocsFromCollection('hrPositions')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var AddAllHRPositionsToDatabase = function(hrPositions) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(hrPositions, 'hrPositions')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ProcessHRPositionsData = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve hr positions processing status
			ReturnHRPositionsDataProcessingStatus()
			// if the promise is resolved with the setting
			.then(function(hrPositionsDataProcessingStatus) {
				// if it's ok to process hr positions
				if (hrPositionsDataProcessingStatus.dataProcessingStatus === true) {
					// get a promise to set dataProcessingNow to true
					ReplaceOneHRPositionsSetting({ "dataProcessingNow": true })
					// if the promise to set dataProcessingNow to true was resolved
					.then(function(replaceOneHRPositionsSettingResult) {
						// get a promise to get all hr positions from excel
						ReturnAllHRPositionsFromExcel()
						// if the promise to get all hr positions from excel was resolved with the hr positions
						.then(function(returnAllHRPositionsFromExcelResult) {
							// extract the data from the result
							var hrPositionsRaw = returnAllHRPositionsFromExcelResult.hrPositions;
							// remove any empty arrays
							var hrPositionsCleaned = hrPositionsRaw.filter(function(row){
								return row.length > 0;
							});
							// convert the array of arrays into an array of objects; see function documentation for more info
							var hrPositionsArrayOfObjects = nesoUtilities.ReturnArrayOfArraysWithFirstArrayHeaderAsArrayOfMappedJSONObjects(hrPositionsCleaned);
							// get a promise to delete all hr positions from the database
							DeleteAllHRPositionsaFromDatabase()
							// if the promise to delete all hr positions from the database was resolved
							.then(function(deleteAllHRPositionsaFromDatabaseResult) {
								// get a promise to add hr positions from excel to the database
								AddAllHRPositionsToDatabase(hrPositionsArrayOfObjects)
								// if the promise to add hr positions from excel to the database was resolved
								.then(function(addAllHRPositionsToDatabaseResult) {
									// get a promise to set dataProcessingNow to false
									ReplaceOneHRPositionsSetting({ "dataProcessingNow": false })
									// if the promise to set dataProcessingNow to false was resolved with the result
									.then(function(replaceOneHRPositionsSettingResult) { 
										// resolve this promise with a message
										resolve( { "error": false } );
									})
									// if the promise to set dataProcessingNow to false was rejected with an error
									.catch(function (error) {
										// reject this promise with the error
										reject(error);
									});
								})
								// if the promise to add hr positions from excel to the database was rejected with an error
								.catch(function (addAllHRPositionsToDatabaseError) { 
									// get a promise to set dataProcessingNow to false
									ReplaceOneHRPositionsSetting({ "dataProcessingNow": false })
									// if the promise to set dataProcessingNow to false was resolved with the result
									.then(function(replaceOneHRPositionsSettingResult) { 
										// reject this promise with the error
										reject(addAllHRPositionsToDatabaseError);
									})
									// if the promise to add hr positions from excel to the database was rejected with an error
									.catch(function (replaceOneHRPositionsSettingError) {
										// construct a custom error
										var errorToReport = {
											"error": true,
											"mongoDBError": true,
											"errorCollection": [
												addAllHRPositionsToDatabaseError.mongoDBErrorDetails,
												replaceOneHRPositionsSettingError.mongoDBErrorDetails
											]
										};
										// process error
										nesoErrors.ProcessError(errorToReport);
										// reject this promise with the error
										reject(errorToReport);
									});
								});
							})
							// if the promise to delete all hr positions from the database was rejected with an error
							.catch(function (deleteAllHRPositionsFromDatabaseError) { 
								// get a promise to set dataProcessingNow to false
								ReplaceOneHRPositionsSetting({ "dataProcessingNow": false })
								// if the promise to set dataProcessingNow to false was resolved with the result
								.then(function(replaceOneHRPositionsSettingResult) { 
									// reject this promise with the error
									reject(deleteAllHRPositionsFromDatabaseError);
								})
								// if the promise to add hr positions from excel to the database was rejected with an error
								.catch(function (replaceOneHRPositionsSettingError) {
									// construct a custom error
									var errorToReport = {
										"error": true,
										"mongoDBError": true,
										"errorCollection": [
											deleteAllHRPositionsFromDatabaseError.mongoDBErrorDetails,
											replaceOneHRPositionsSettingError.mongoDBErrorDetails
										]
									};
									// process error
									nesoErrors.ProcessError(errorToReport);
									// reject this promise with the error
									reject(errorToReport);
								});
							});
						})
						// if the promise to get all hr positions from excel was rejected with an error
						.catch(function (returnAllHRPositionsFromExcelError) { 
							// get a promise to set dataProcessingNow to false
							ReplaceOneHRPositionsSetting({ "dataProcessingNow": false })
							// if the promise to set dataProcessingNow to false was resolved with the result
							.then(function(replaceOneHRPositionsSettingResult) { 
								// reject this promise with the error
								reject(returnAllHRPositionsFromExcelError);
							})
							// if the promise to add hr positions from excel to the database was rejected with an error
							.catch(function (replaceOneHRPositionsSettingError) {
								// construct a custom error
								var errorToReport = {
									"error": true,
									"mongoDBError": true,
									"errorCollection": [
										returnAllHRPositionsFromExcelError.mongoDBErrorDetails,
										replaceOneHRPositionsSettingError.mongoDBErrorDetails
									]
								};
								// process error
								nesoErrors.ProcessError(errorToReport);
								// reject this promise with the error
								reject(errorToReport);
							});
						});
					})
					// if the promise to set dataProcessingNow to true was rejected with an error, then reject this promise with the error
					.catch(function (error) { reject(error) });
				// if it's NOT ok to process hr positions
				} else {
					// reject this promise with the error
					reject({
						"error": true,
						"settingsError": "dataProcessingStatus === false"
					});
				}
			})
			// if the promise to retrieve hr positions processing status is rejected with an error, then reject this promise with the error
			.catch(function (error) { reject(error) });
		});
	};




	return {
		ReturnHRPositionsSettings: ReturnHRPositionsSettings,
		ReturnHRPositionsDataProcessingStatus: ReturnHRPositionsDataProcessingStatus,
		ReturnHRPositionsDataProcessingNow: ReturnHRPositionsDataProcessingNow,
		ReturnHRPositionsExcelSettings: ReturnHRPositionsExcelSettings,
		ReturnHRPositionsWhitelistedDomains: ReturnHRPositionsWhitelistedDomains,
		ReplaceAllHRPositionsSettings: ReplaceAllHRPositionsSettings,
		ReplaceOneHRPositionsSetting: ReplaceOneHRPositionsSetting,
		ReturnAllHRPositionsFromExcel: ReturnAllHRPositionsFromExcel,
		DeleteAllHRPositionsaFromDatabase: DeleteAllHRPositionsaFromDatabase,
		AddAllHRPositionsToDatabase: AddAllHRPositionsToDatabase,
		ProcessHRPositionsData: ProcessHRPositionsData

	};
}();

module.exports = nesoHRPositions;