
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// enable use of "fs" node module; this enables us to perform operations on the file system
var fs = require('fs');
// enable use of "csvtojson" node module; this provides "a comprehensive nodejs csv parser to convert csv to json"
var csv = require('csvtojson');

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

var nesoActiveDirectory = function() {

	var ReturnADSettings = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('adSettings')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnADDataProcessingStatus = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnADSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "dataProcessingStatus": settings["docs"][0]["dataProcessingStatus"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnADDataProcessingNow = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnADSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "dataProcessingNow": settings["docs"][0]["dataProcessingNow"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnADCSVSettings = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnADSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "csv": settings["docs"][0]["csvOptions"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnADWhitelistedDomains = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnADSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "whitelistedDomains": settings["docs"][0]["whitelistedDomains"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error)});
		});
	};

	var ReplaceAllADSettings = function(newSettings) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnADSettings()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(existingSettings) { 
				// get a promise to replace the settings in the emailSettings document collection
				nesoDBQueries.OverwriteDocInCollection(existingSettings["docs"][0]["_id"], newSettings, 'adSettings')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then(function(result) { resolve(result) })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch(function (error) {reject(error) })
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReplaceOneADSetting = function(newSingleSettingObject) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnADSettings()
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
				nesoDBQueries.OverwriteDocInCollection(existingSettings["docs"][0]["_id"], newSettings, 'adSettings')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then(function(result) { resolve(result) })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch(function (error) {reject(error) })
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnAllADUsersFromCSV = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve excel settings
			ReturnADCSVSettings()
			// if the promise to retrieve excel settings is resolved with the settings
			.then(function(settings) {
				// try to resolve this promise with the ad users data
				try {
					// get data from the csv file
					csv().fromFile(settings.csv.usersFilePathAndName)
					// when the data has been parsed
					.on("end_parsed",function(adUsersRaw){
						// set up an empty array to receive a transformed version of the data
						var adUsersTransformed = [];
						// iterate over raw users array
						for (const adUserRaw of adUsersRaw) {
							// ignore any empty results; we test against the value that will be the unique ID because we can't 
							//		use any results without a unique ID anyway
							if ( typeof(adUserRaw.userPrincipalName) !== "undefined") {
								// extract and transform some of the data
								var userAccount = nesoUtilities.StrInStr(adUserRaw.userPrincipalName.toLowerCase(), "@mos.org", 1);
								var managerArray = adUserRaw.manager.split(",");
								var managerAccount = nesoUtilities.StrInStr(managerArray[0].toLowerCase(), "cn=", 3);
								var allGroupsAllDataArray = adUserRaw.memberOf.split(";");
								var securityGroups = [];
								for (const oneGroupWithAllDataString of allGroupsAllDataArray) {
									var oneGroupWithAllDataArray = oneGroupWithAllDataString.split(",");
									if (nesoUtilities.StrInStr(oneGroupWithAllDataArray[1], "Exchange") === false) {
										securityGroups.push(nesoUtilities.StrInStr(oneGroupWithAllDataArray[0], "CN=", 3));
									}
								}
								// push a transformed user to adUsersTransformed
								adUsersTransformed.push({
									"account": userAccount,
									"employeeID": adUserRaw.employeeID,
									"firstName": adUserRaw.givenName,
									"lastName": adUserRaw.sn,
									"displayName": adUserRaw.displayName,
									"title": adUserRaw.title,
									"email": adUserRaw.mail,
									"officePhone": adUserRaw.telephoneNumber,
									"mobilePhone": adUserRaw.mobile,
									"manager": managerAccount,
									"department": adUserRaw.department,
									"division": adUserRaw.division,
									"securityGroups": securityGroups,
								});
							}
						}
						// resolve this promise with a message
						resolve({
							"error": false,
							"csvError": false,
							"activeDirectoryUsers": adUsersTransformed
						});
					});
				// if there was an error
				} catch (exception) {
					console.log(exception);
					// construct a custom error
					var errorToReport = {
						"error": true,
						"csvError": true
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

	var ReturnAllADUsersByDivisionDepartmentFromADUsers = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to get all ad users from csv
			ReturnAllADUsersFromCSV()
			// if the promise to get all ad users from csv was resolved with the ad users
			.then(function(returnAllActiveDirectoryUsersFromCSVResult) {
				// extract the data from the result
				var adUsers = returnAllActiveDirectoryUsersFromCSVResult.activeDirectoryUsers;
				// set up empty object to receive the new data
				var adUsersByDivisionDepartment = {};
				// iterate over adUsers
				for (const adUser of adUsers) {
					// if this user has a division and department (ReturnAllADUsersFromCSV() will not return anyone without an account)
					if (typeof(adUser.division) !== "undefined" && adUser.division !== "" && typeof(adUser.department) !== "undefined" && adUser.department !== "") {
						// if this user's division is not already in adUsersByDivisionDepartment
						if (typeof(adUsersByDivisionDepartment[adUser.division]) === "undefined") {
							// add it as an empty object
							adUsersByDivisionDepartment[adUser.division] = {};
						}
						// if this user's department is not already in adUsersByDivisionDepartment
						if (typeof(adUsersByDivisionDepartment[adUser.division][adUser.department]) === "undefined") {
							// add it as an empty array
							adUsersByDivisionDepartment[adUser.division][adUser.department] = [];
						}
						// add this user to the department
						adUsersByDivisionDepartment[adUser.division][adUser.department].push(adUser);
					}
				}
				// resolve this promise with a message and the data
				resolve({
					"error": false,
					"csvError": false,
					"adUsersByDivisionDepartment": adUsersByDivisionDepartment
				});
			})
			// if the promise to get all ad users from csv was rejected with an error
			.catch(function (returnAllActiveDirectoryUsersFromCSVError) {
				// reject this promise with the error
				reject(returnAllActiveDirectoryUsersFromCSVError);
			});
		});
	};

	var DeleteAllADUsersFromDatabase = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adUsers')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var DeleteAllADUsersByDivisionDepartmentFromDatabase = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the adUsersByDivisionDepartment document collection
			nesoDBQueries.DeleteAllDocsFromCollection('adUsersByDivisionDepartment')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var AddAllADUsersToDatabase = function(adUsers) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(adUsers, 'adUsers')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var AddAllADUsersByDivisionDepartmentToDatabase = function(adUsersByDivisionDepartment) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			console.log("adUsersByDivisionDepartment");
			console.log(adUsersByDivisionDepartment);
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(adUsersByDivisionDepartment, 'adUsersByDivisionDepartment')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ProcessADUsersData = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve ad processing status
			ReturnADDataProcessingStatus()
			// if the promise is resolved with the setting
			.then(function(adUsersDataProcessingStatus) {
				// if it's ok to process ad users
				if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
					// get a promise to set dataProcessingNow to true
					ReplaceOneADSetting({ "dataProcessingNow": true })
					// if the promise to set dataProcessingNow to true was resolved
					.then(function(replaceOneActiveDirectorySettingResult) {
						// get a promise to get all ad users from csv
						ReturnAllADUsersFromCSV()
						// if the promise to get all ad users from csv was resolved with the ad users
						.then(function(returnAllActiveDirectoryUsersFromCSVResult) {
							// extract the data from the result
							var adUsers = returnAllActiveDirectoryUsersFromCSVResult.activeDirectoryUsers;
							// get a promise to delete all ad users from the database
							DeleteAllADUsersFromDatabase()
							// if the promise to delete all ad users from the database was resolved
							.then(function(deleteAllActiveDirectoryUsersFromDatabaseResult) {
								// get a promise to add ad users from csv to the database
								AddAllADUsersToDatabase(adUsers)
								// if the promise to add ad users from csv to the database was resolved
								.then(function(addAllActiveDirectoryUsersToDatabaseResult) {
									// get a promise to set dataProcessingNow to false
									ReplaceOneADSetting({ "dataProcessingNow": false })
									// if the promise to set dataProcessingNow to false was resolved with the result
									.then(function(replaceOneActiveDirectorySettingResult) { 
										// resolve this promise with a message
										resolve( { "error": false } );
									})
									// if the promise to set dataProcessingNow to false was rejected with an error
									.catch(function (error) {
										// reject this promise with the error
										reject(error);
									});
								})
								// if the promise to add ad users from csv to the database was rejected with an error
								.catch(function (addAllActiveDirectoryUsersToDatabaseError) { 
									// get a promise to set dataProcessingNow to false
									ReplaceOneADSetting({ "dataProcessingNow": false })
									// if the promise to set dataProcessingNow to false was resolved with the result
									.then(function(replaceOneActiveDirectorySettingResult) { 
										// reject this promise with the error
										reject(addAllActiveDirectoryUsersToDatabaseError);
									})
									// if the promise to add ad users from csv to the database was rejected with an error
									.catch(function (replaceOneADSettingError) {
										// construct a custom error
										var errorToReport = {
											"error": true,
											"mongoDBError": true,
											"errorCollection": [
												addAllActiveDirectoryUsersToDatabaseError.mongoDBErrorDetails,
												replaceOneADSettingError.mongoDBErrorDetails
											]
										};
										// process error
										nesoErrors.ProcessError(errorToReport);
										// reject this promise with the error
										reject(errorToReport);
									});
								});
							})
							// if the promise to delete all ad users from the database was rejected with an error
							.catch(function (deleteAllActiveDirectoryUsersFromDatabaseError) { 
								// get a promise to set dataProcessingNow to false
								ReplaceOneADSetting({ "dataProcessingNow": false })
								// if the promise to set dataProcessingNow to false was resolved with the result
								.then(function(replaceOneActiveDirectorySettingResult) { 
									// reject this promise with the error
									reject(deleteAllActiveDirectoryUsersFromDatabaseError);
								})
								// if the promise to add ad users from csv to the database was rejected with an error
								.catch(function (replaceOneADSettingError) {
									// construct a custom error
									var errorToReport = {
										"error": true,
										"mongoDBError": true,
										"errorCollection": [
											deleteAllActiveDirectoryUsersFromDatabaseError.mongoDBErrorDetails,
											replaceOneADSettingError.mongoDBErrorDetails
										]
									};
									// process error
									nesoErrors.ProcessError(errorToReport);
									// reject this promise with the error
									reject(errorToReport);
								});
							});
						})
						// if the promise to get all ad users from csv was rejected with an error
						.catch(function (returnAllActiveDirectoryUsersFromCSVError) { 
							// get a promise to set dataProcessingNow to false
							ReplaceOneADSetting({ "dataProcessingNow": false })
							// if the promise to set dataProcessingNow to false was resolved with the result
							.then(function(replaceOneActiveDirectorySettingResult) { 
								// reject this promise with the error
								reject(returnAllActiveDirectoryUsersFromCSVError);
							})
							// if the promise to add ad users from csv to the database was rejected with an error
							.catch(function (replaceOneADSettingError) {
								// construct a custom error
								var errorToReport = {
									"error": true,
									"mongoDBError": true,
									"errorCollection": [
										returnAllActiveDirectoryUsersFromCSVError.mongoDBErrorDetails,
										replaceOneADSettingError.mongoDBErrorDetails
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
				// if it's NOT ok to process ad users
				} else {
					// reject this promise with the error
					reject({
						"error": true,
						"settingsError": "dataProcessingStatus === false"
					});
				}
			})
			// if the promise to retrieve ad users processing status is rejected with an error, then reject this promise with the error
			.catch(function (error) { reject(error) });
		});
	};

	var ProcessADUsersByDivisionDepartmentData = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve ad processing status
			ReturnADDataProcessingStatus()
			// if the promise is resolved with the setting
			.then(function(adUsersDataProcessingStatus) {
				// if it's ok to process ad users
				if (adUsersDataProcessingStatus.dataProcessingStatus === true) {
					// get a promise to set dataProcessingNow to true
					ReplaceOneADSetting({ "dataProcessingNow": true })
					// if the promise to set dataProcessingNow to true was resolved
					.then(function(replaceOneActiveDirectorySettingResult) {
						// get a promise to get all ad users from csv
						ReturnAllADUsersByDivisionDepartmentFromADUsers()
						// if the promise to get all ad users from csv was resolved with the ad users
						.then(function(returnAllADUsersByDivisionDepartmentFromADUsersResult) {
							// extract the data from the result
							var adUsersByDivisionDepartment = returnAllADUsersByDivisionDepartmentFromADUsersResult.adUsersByDivisionDepartment;
							// get a promise to delete all ad users from the database
							DeleteAllADUsersByDivisionDepartmentFromDatabase()
							// if the promise to delete all ad users from the database was resolved
							.then(function(deleteAllADUsersByDivisionDepartmentFromDatabaseResult) {
								// get a promise to add ad users from csv to the database
								AddAllADUsersByDivisionDepartmentToDatabase(adUsersByDivisionDepartment)
								// if the promise to add ad users from csv to the database was resolved
								.then(function(addAllADUsersByDivisionDepartmentToDatabaseResult) {
									// get a promise to set dataProcessingNow to false
									ReplaceOneADSetting({ "dataProcessingNow": false })
									// if the promise to set dataProcessingNow to false was resolved with the result
									.then(function(replaceOneActiveDirectorySettingResult) { 
										// resolve this promise with a message
										resolve( { "error": false } );
									})
									// if the promise to set dataProcessingNow to false was rejected with an error
									.catch(function (error) {
										// reject this promise with the error
										reject(error);
									});
								})
								// if the promise to add ad users from csv to the database was rejected with an error
								.catch(function (addAllADUsersByDivisionDepartmentToDatabaseError) { 
									// get a promise to set dataProcessingNow to false
									ReplaceOneADSetting({ "dataProcessingNow": false })
									// if the promise to set dataProcessingNow to false was resolved with the result
									.then(function(replaceOneActiveDirectorySettingResult) { 
										// reject this promise with the error
										reject(addAllADUsersByDivisionDepartmentToDatabaseError);
									})
									// if the promise to add ad users from csv to the database was rejected with an error
									.catch(function (replaceOneADSettingError) {
										// construct a custom error
										var errorToReport = {
											"error": true,
											"mongoDBError": true,
											"errorCollection": [
												addAllADUsersByDivisionDepartmentToDatabaseError.mongoDBErrorDetails,
												replaceOneADSettingError.mongoDBErrorDetails
											]
										};
										// process error
										nesoErrors.ProcessError(errorToReport);
										// reject this promise with the error
										reject(errorToReport);
									});
								});
							})
							// if the promise to delete all ad users from the database was rejected with an error
							.catch(function (deleteAllADUsersByDivisionDepartmentFromDatabaseError) { 
								// get a promise to set dataProcessingNow to false
								ReplaceOneADSetting({ "dataProcessingNow": false })
								// if the promise to set dataProcessingNow to false was resolved with the result
								.then(function(replaceOneActiveDirectorySettingResult) { 
									// reject this promise with the error
									reject(deleteAllADUsersByDivisionDepartmentFromDatabaseError);
								})
								// if the promise to add ad users from csv to the database was rejected with an error
								.catch(function (replaceOneADSettingError) {
									// construct a custom error
									var errorToReport = {
										"error": true,
										"mongoDBError": true,
										"errorCollection": [
											deleteAllADUsersByDivisionDepartmentFromDatabaseError.mongoDBErrorDetails,
											replaceOneADSettingError.mongoDBErrorDetails
										]
									};
									// process error
									nesoErrors.ProcessError(errorToReport);
									// reject this promise with the error
									reject(errorToReport);
								});
							});
						})
						// if the promise to get all ad users from csv was rejected with an error
						.catch(function (returnAllADUsersByDivisionDepartmentFromADUsersError) { 
							// get a promise to set dataProcessingNow to false
							ReplaceOneADSetting({ "dataProcessingNow": false })
							// if the promise to set dataProcessingNow to false was resolved with the result
							.then(function(replaceOneActiveDirectorySettingResult) { 
								// reject this promise with the error
								reject(returnAllADUsersByDivisionDepartmentFromADUsersError);
							})
							// if the promise to add ad users from csv to the database was rejected with an error
							.catch(function (replaceOneADSettingError) {
								// construct a custom error
								var errorToReport = {
									"error": true,
									"mongoDBError": true,
									"errorCollection": [
										returnAllADUsersByDivisionDepartmentFromADUsersError.mongoDBErrorDetails,
										replaceOneADSettingError.mongoDBErrorDetails
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
				// if it's NOT ok to process ad users
				} else {
					// reject this promise with the error
					reject({
						"error": true,
						"settingsError": "dataProcessingStatus === false"
					});
				}
			})
			// if the promise to retrieve ad users processing status is rejected with an error, then reject this promise with the error
			.catch(function (error) { reject(error) });
		});
	};



	return {
		ReturnADSettings: ReturnADSettings,
		ReturnADDataProcessingStatus: ReturnADDataProcessingStatus,
		ReturnADDataProcessingNow: ReturnADDataProcessingNow,
		ReturnADCSVSettings: ReturnADCSVSettings,
		ReturnADWhitelistedDomains: ReturnADWhitelistedDomains,
		ReplaceAllADSettings: ReplaceAllADSettings,
		ReplaceOneADSetting: ReplaceOneADSetting,
		ReturnAllADUsersFromCSV: ReturnAllADUsersFromCSV,
		ReturnAllADUsersByDivisionDepartmentFromADUsers: ReturnAllADUsersByDivisionDepartmentFromADUsers,
		DeleteAllADUsersFromDatabase: DeleteAllADUsersFromDatabase,
		DeleteAllADUsersByDivisionDepartmentFromDatabase: DeleteAllADUsersByDivisionDepartmentFromDatabase,
		AddAllADUsersToDatabase: AddAllADUsersToDatabase,
		AddAllADUsersByDivisionDepartmentToDatabase: AddAllADUsersByDivisionDepartmentToDatabase,
		ProcessADUsersData: ProcessADUsersData,
		ProcessADUsersByDivisionDepartmentData: ProcessADUsersByDivisionDepartmentData

	};
}();

module.exports = nesoActiveDirectory;