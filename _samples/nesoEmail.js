
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// enable use of "fs" node module; this enables us to perform operations on the file system
var fs = require('fs');
// enable use of "monk" node module; this provides "simple yet substantial usability improvements for MongoDB usage within Node.JS"
var monk = require('monk');
// use the "nodemailer" node module; this will transport a message to an SMTP server
var nodemailer = require('nodemailer');

// use the "nesoDBConnection" neso module; this is sufficient to bring in the database connection
var nesoDBConnection = require('./nesoDBConnection');
// use the "nesoDBQueries" neso module; this allows us to use some standardized and convenient query methods
var nesoDBQueries = require('./nesoDBQueries');
// use the "nesoUtilities" neso module; this allows us to use some generic utility functions
var nesoUtilities = require('./nesoUtilities');
// use the "nesoErrors" neso module; this allows us to do stuff with error
var nesoErrors = require('./nesoErrors');




/*********************************************************************
	DEFINE EMAIL FUNCTIONS
*********************************************************************/

var nesoEmail = function() {
		
	var ReturnEmailQueueData = function(req) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.ReturnAllDocsFromCollection('emailQueue')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnEmailArchiveData = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailArchive document collection
			nesoDBQueries.ReturnAllDocsFromCollection('emailArchive')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnEmailSettingsData = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailSettings document collection
			nesoDBQueries.ReturnAllDocsFromCollection('emailSettings')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnEmailTransporterOptions = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnEmailSettingsData()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "transporterOptions": settings["docs"][0]["transporterOptions"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnEmailSMTPProcessingStatus = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnEmailSettingsData()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "smtpProcessingStatus": settings["docs"][0]["smtpProcessingStatus"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnEmailQueueProcessingStatus = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnEmailSettingsData()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "queueProcessingStatus": settings["docs"][0]["queueProcessingStatus"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReturnEmailWhitelistedDomains = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnEmailSettingsData()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) { resolve( { "error": settings.error, "whitelistedDomains": settings["docs"][0]["whitelistedDomains"] } ) } )
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error)});
		});
	};

	var ReturnNodemailerTransporter = function(transporterOptions) {
		// return a nodemailer transporter using Neso configuration
		return nodemailer.createTransport({
			host: transporterOptions.host,
			port: transporterOptions.port,
			secure: transporterOptions.secure
		});
	};

	var VerifySMTP = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve email transporter settings
			ReturnEmailTransporterOptions()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(settings) {
				// get a nodemailer transporter using Neso configuration
				var transporter = ReturnNodemailerTransporter(settings.transporterOptions);
				// attempt to verify the SMTP connection made using nodemailer transporter
				transporter.verify(function(error, success) {
					// if there was an error
					if (error) {
						// construct a custom error
						var errorToReport = {
							"error": true,
							"transportError": true,
							"transportErrorDetails": error
						};
						// process error
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
					// if there was NOT an error
					} else {
						// otherwise, resolve the promise and return a message
						resolve({
							"error": false,
							"transportError": false,
						});
					}
				});
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error)});
		});
	};

	var TransportEmailToSMTP = function(email) {

		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve email transporter settings
			ReturnEmailTransporterOptions()
			// if the promise to retrieve email transporter settings is resolved with the settings, then respond with the settings as JSON
			.then(function(settings) { 
				// get a nodemailer transporter using Neso configuration
				var transporter = ReturnNodemailerTransporter(settings.transporterOptions);
				// attempt to transport email using nodemailer transporter
				transporter.sendMail(email, (error, info) => {
					// if there was an error
					if (error) {
						console.log("EMAIL ERROR");
						console.log(error);
						// construct a custom error
						var errorToReport = {
							"error": true,
							"transportError": true,
							"transportErrorDetails": error,
							"email": email
						};
						// process error
						nesoErrors.ProcessError(errorToReport);
						// reject this promise with the error
						reject(errorToReport);
					// if there was NOT an error
					} else {
						// resolve this promise with the message id
						console.log("SUCCESS");
						// resolve this promise with a message
						resolve({
							"error": false,
							"transportError": false,
							"messageId": info.messageId,
							"email": email
						});
					}
				});
			})
			// if the promise to retrieve email transporter settings is rejected with an error
			.catch(function (error) { 
				// error is standard db error; augment it with the email
				error.email = email;
				// then reject this promise with the error
				reject(error) 
			});
		// end promise
		});
	};

	var SendEmail = function(email) {
		// return a new promise
		return new Promise(function(resolve, reject) {			
			// add a timestamp to the email
			email.nesoReceivedTime = nesoUtilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to transport to SMTP server
			TransportEmailToSMTP(email)
			// if the promise to transport to SMTP server is resolved with a messageID
			.then(function(transportResults) {
				// if the email has no ID (because it didn't come from the queue), create a placeholder;
				// 		this allows us to structure the following code more simply (always only waiting
				// 		on two promise resolutions, rather than sometimes one and sometimes two)
				if (typeof(email._id) === "undefined") {
					email._id = null;
				}
				// get promises to async delete email from queue and async add email to archive
				Promise.all([DeleteQueuedEmail(email._id), AddEmailToArchive(email)])
				// when all promises have resolved
				.then(function(deleteAndArchiveResults) {
					// extract results for convenience
					var deleteResults = deleteAndArchiveResults[0];
					var archiveResults = deleteAndArchiveResults[1];
					// if there was no deletion error and no archive error
					if (deleteResults.error !== true && archiveResults.error !== true) {
						// resolve the SendEmail promise with a message
						resolve({
							"error": false,
							"transportError": transportResults.transportError,
							"mongoDBError": false,
							"messageId": transportResults.messageId,
							"email": transportResults.email
						});
					} else {
						// start constructing result
						var emailSendingResult = {
							"error": true,
							"transportError": transportResults.transportError,
							"mongoDBError": true,
							"messageId": transportResults.messageId,
							"email": transportResults.email
						};
						// if there was a deletion error
						if (deleteResults.error !== true) {
							emailSendingResult.errorCollection = [];
							emailSendingResult.errorCollection.push(deleteResults);
						}
						// if there was an archive error
						if (archiveResults.error !== true) {
							if (typeof(emailSendingResult.errorCollection) === "undefined") {
								emailSendingResult.errorCollection = [];
							}
							emailSendingResult.errorCollection.push(archiveResults);
						}
						// process error
						nesoErrors.ProcessError(emailSendingResult);
						// resolve the SendEmail promise with a message
						resolve(emailSendingResult);
					}
				});
			})
			// if the promise to transport to SMTP server is rejected with a result
			.catch(function (transportResults) {
				// if this email did not come from the queue (i.e., don't queue already-queued emails)
				if (typeof(email.nesoQueuedTime) === "undefined") {
					// get a promise to add email to queue
					AddEmailToQueue(transportResults.email)
					// if the promise to add email to queue is resolved with a result
					.then(function(addToQueueResult) {
						// construct a custom error
						var errorToReport = {
							"error": true,
							"transportError": transportResults.transportError,
							"transportErrorDetails": transportResults.transportErrorDetails,
							"mongoDBError": addToQueueResult.mongoDBError,
							"email": transportResults.email
						};
						// process error
						nesoErrors.ProcessError(errorToReport);
						// resolve the SendEmail promise with a message
						resolve(errorToReport);
					})
					// if the promise to add email to queue is rejected with an error
					.catch(function (addToQueueResult) {
						// construct a custom error
						var errorToReport = {
							"error": true,
							"transportError": transportResults.transportError,
							"transportErrorDetails": transportResults.transportErrorDetails,
							"emergencyError": true,
							"emergencyErrorDetails": "Transport error and queue error",
							"mongoDBError": addToQueueResult.mongoDBError,
							"mongoDBErrorDetails": addToArchiveResult.mongoDBErrorDetails,
							"email": transportResults.email
						};
						// process error
						nesoErrors.ProcessError(errorToReport);
						// resolve the SendEmail promise with a message
						resolve(errorToReport);
					});
				// if email came from the queue
				} else {
					// construct a custom error
					var errorToReport = {
						"error": true,
						"transportError": transportResults.transportError,
						"transportErrorDetails": transportResults.transportErrorDetails,
						"email": transportResults.email
					};
					// process error
					nesoErrors.ProcessError(errorToReport);
					// resolve the SendEmail promise with a message
					resolve(errorToReport);
				}
			});
		});
	};

	var ProcessEmailQueue = function() {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email queue data
			ReturnEmailQueueData()
			// if the promise is resolved with the docs
			.then(function(emailQueueData) {
				// start constructing result, defaulting to no errors
				var emailQueueProcessingResult = {
					"error": false,
					"emailQueueProcessingError": false,
					"quantityEmailsInQueue": emailQueueData.docs.length,
					"quantityEmailsSent": 0
				};
				// if there are emails to be sent
				if (emailQueueData.docs.length > 0) {
					// get a promise to attempt to send each email
					SendEachEmailFromArray(emailQueueData.docs)
					// when the promise to attempt to send each email is resolved
					.then(function(emailArraySendingResult) {
						// parse the result and store in this function's result
						emailQueueProcessingResult.error = emailArraySendingResult.error;
						emailQueueProcessingResult.emailQueueProcessingError = emailArraySendingResult.emailArraySendingError;
						emailQueueProcessingResult.quantityEmailsSent = emailArraySendingResult.quantityEmailsSent;
						if (typeof(emailArraySendingResult.errorCollection) !== "undefined") {
							emailQueueProcessingResult.errorCollection = emailArraySendingResult.errorCollection;
						}
						// resolve this promise with the result
						resolve(emailQueueProcessingResult);
					});
				// if there are no emails to be sent
				} else {
					// resolve this promise with a message
					resolve(emailQueueProcessingResult);
				}
			})
			// if the promise to retrieve all email queue data is rejected with an error, then reject this promise with the error
			.catch(function (error) { reject(error) });
		});
	};

	var SendEachEmailFromArray = function(emailArray) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// start constructing result, defaulting to no errors
			var emailArraySendingResult = {
				"error": false,
				"emailArraySendingError": false,
				"quantityEmailsInArray": emailArray.length,
				"quantityEmailsAttempted": 0,
				"quantityEmailsSent": 0
			};
			// iterate over the array of emails
			for (let [index, email] of emailArray.entries()) {
				// get a promise to send this email
				SendEmail(email)
				// when the promise to send this email is resolved
				.then(function(sendEmailResult) {
					// if there was a transport or mongoDB error
					if (sendEmailResult.error === true) {
						// make sure error is true and collect errors, creating collection if it doesn't exist
						emailArraySendingResult.error = true;
						emailArraySendingResult.emailArraySendingError = true;
						if (typeof(emailArraySendingResult.errorCollection) === "undefined") {
							emailArraySendingResult.errorCollection = [];
						}
						emailArraySendingResult.errorCollection.push(sendEmailResult);
						// if the error was not a transport error
						if (typeof(sendEmailResult.transportError) === "undefined") {
							// increment emails sent
							emailArraySendingResult.quantityEmailsSent++;
						}
					// if there was NOT a transport or mongoDB error
					} else {
						// increment emails sent
						emailArraySendingResult.quantityEmailsSent++;
					}
					// if this was the last email in the array
					if ((index + 1) === emailArraySendingResult.quantityEmailsInArray) {
						resolve(emailArraySendingResult);
					}
				});

			}

		});
	};

	var AddEmailToQueue = function(email) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// add a timestamp to the email
			email.nesoQueuedTime = nesoUtilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(email, 'emailQueue')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};
		
	var AddEmailToArchive = function(email) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// add a timestamp to the email
			email.nesoArchivedTime = nesoUtilities.ReturnFormattedDateTime('nowUTC', null, null);
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.InsertDocIntoCollection(email, 'emailArchive')
			// if the promise is resolved with the result, then resolve this promise with the result
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReplaceQueuedEmail = function(emailID, email) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to replace the email in the emailQueue document collection
			nesoDBQueries.OverwriteDocInCollection(emailID, email, 'emailQueue')
			// if the promise is resolved with the counts, then resolve this promise with the counts
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) {reject(error) });
		});
	};
	
	var ReplaceArchivedEmail = function(emailID, email) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to replace the email in the emailQueue document collection
			nesoDBQueries.OverwriteDocInCollection(emailID, email, 'emailArchive')
			// if the promise is resolved with the counts, then resolve this promise with the counts
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) {reject(error) });
		});
	};

	var ReplaceAllEmailSettings = function(newSettings) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnEmailSettingsData()
			// if the promise is resolved with the settings, then resolve this promise with the requested setting
			.then(function(existingSettings) { 
				// get a promise to replace the settings in the emailSettings document collection
				nesoDBQueries.OverwriteDocInCollection(existingSettings["docs"][0]["_id"], newSettings, 'emailSettings')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then(function(result) { resolve(result) })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch(function (error) {reject(error) })
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var ReplaceOneEmailSetting = function(newSingleSettingObject) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all email settings
			ReturnEmailSettingsData()
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
				nesoDBQueries.OverwriteDocInCollection(existingSettings["docs"][0]["_id"], newSettings, 'emailSettings')
				// if the promise is resolved with the counts, then resolve this promise with the counts
				.then(function(result) { resolve(result) })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch(function (error) {reject(error) })
			})
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var DeleteQueuedEmail = function(docID) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// get a promise to retrieve all documents from the emailQueue document collection
			nesoDBQueries.DeleteDocFromCollection(docID, 'emailQueue')
			// if the promise is resolved with the docs, then resolve this promise with the docs
			.then(function(result) { resolve(result) })
			// if the promise is rejected with an error, then reject this promise with an error
			.catch(function (error) { reject(error) });
		});
	};

	var DeleteArchivedEmail = function(docID) {
		// return a new promise
		return new Promise(function(resolve, reject) {
			// if there is a docID
			if (docID !== null) {
				// get a promise to retrieve all documents from the emailQueue document collection
				nesoDBQueries.DeleteDocFromCollection(docID, 'emailArchive')
				// if the promise is resolved with the docs, then resolve this promise with the docs
				.then(function(result) { resolve(result) })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch(function (error) { reject(error) });
			// if there is no real docID, resolve this promise with a non-error
			} else {
				resolve({ "error": false, "mongoDBError": false });
			}
		});
	};






	return {
		ReturnEmailQueueData: ReturnEmailQueueData,
		ReturnEmailArchiveData: ReturnEmailArchiveData,
		ReturnEmailSettingsData: ReturnEmailSettingsData,
		ReturnEmailTransporterOptions: ReturnEmailTransporterOptions,
		ReturnEmailSMTPProcessingStatus: ReturnEmailSMTPProcessingStatus,
		ReturnEmailQueueProcessingStatus: ReturnEmailQueueProcessingStatus,
		ReturnEmailWhitelistedDomains: ReturnEmailWhitelistedDomains,
		VerifySMTP: VerifySMTP,
		TransportEmailToSMTP: TransportEmailToSMTP,
		SendEmail: SendEmail,
		ProcessEmailQueue: ProcessEmailQueue,
		AddEmailToQueue: AddEmailToQueue,
		AddEmailToArchive: AddEmailToArchive,
		ReplaceQueuedEmail: ReplaceQueuedEmail,
		ReplaceArchivedEmail: ReplaceArchivedEmail,
		ReplaceAllEmailSettings: ReplaceAllEmailSettings,
		ReplaceOneEmailSetting: ReplaceOneEmailSetting,
		DeleteQueuedEmail: DeleteQueuedEmail,
		DeleteArchivedEmail: DeleteArchivedEmail
	};
}();

module.exports = nesoEmail;