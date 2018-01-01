
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// use the "nesoHealth" neso module; this allows us to get system-wide settings
var nesoHealth = require('./nesoHealth');
// use the "nesoEmail" neso module; this allows us to retrieve from the db the array of domains whitelisted for the email API
var nesoEmail = require('./nesoEmail');
// use the "nesoHRPositions" neso module; this allows us to use functions related to HR's position directory data
var nesoHRPositions = require('./nesoHRPositions');
// use the "nesoActiveDirectory" neso module; this allows us to use functions related to Active Directory data
var nesoActiveDirectory = require('./nesoActiveDirectory');



/*********************************************************************
	HELPER FUNCTIONS, GENERAL AND BY API
*********************************************************************/
var nesoCORS = function() {

	var RequestingDomainWhitelistedForHealthAPI = function (req, callback) {
		// get a promise to retrieve from the db the array of domains whitelisted for the health API
		nesoHealth.ReturnHealthWhitelistedDomains()
		// if the promise is resolved with the setting, then
		.then(function(setting) { 
			// set options by passing requesting domain and domains whitelisted for the health APT to RequestingDomainInSpecifiedWhitelist
			var corsOptions = RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
			// pass options to callback in the CORS node module so that it can do its business
			callback(null, corsOptions) // callback expects two parameters: error and options
		})
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch(function (err) { callback(err, null) });
	};

	var RequestingDomainWhitelistedForEmailAPI = function (req, callback) {
		// get a promise to retrieve from the db the array of domains whitelisted for the email API
		nesoEmail.ReturnEmailWhitelistedDomains()
		// if the promise is resolved with the setting, then
		.then(function(setting) { 
			// set options by passing requesting domain and domains whitelisted for the email APT to RequestingDomainInSpecifiedWhitelist
			var corsOptions = RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
			// pass options to callback in the CORS node module so that it can do its business
			callback(null, corsOptions) // callback expects two parameters: error and options
		})
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch(function (err) { callback(err, null) });
	};

	var RequestingDomainWhitelistedForHRPositionsAPI = function (req, callback) {
		// get a promise to retrieve from the db the array of domains whitelisted for the hr positions API
		nesoHRPositions.ReturnHRPositionsWhitelistedDomains()
		// if the promise is resolved with the setting, then
		.then(function(setting) { 
			// set options by passing requesting domain and domains whitelisted for the hr positions APT to RequestingDomainInSpecifiedWhitelist
			var corsOptions = RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
			// pass options to callback in the CORS node module so that it can do its business
			callback(null, corsOptions) // callback expects two parameters: error and options
		})
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch(function (err) { res.json(err) });
	};

	var RequestingDomainWhitelistedForActiveDirectoryAPI = function (req, callback) {
		// get a promise to retrieve from the db the array of domains whitelisted for the ad users API
		nesoActiveDirectory.ReturnActiveDirectoryWhitelistedDomains()
		// if the promise is resolved with the setting, then
		.then(function(setting) { 
			// set options by passing requesting domain and domains whitelisted for the ad users APT to RequestingDomainInSpecifiedWhitelist
			var corsOptions = RequestingDomainInSpecifiedWhitelist(req.header('Origin'), setting.whitelistedDomains);
			// pass options to callback in the CORS node module so that it can do its business
			callback(null, corsOptions) // callback expects two parameters: error and options
		})
		// if the promise is rejected with an error, then respond with the error as JSON
		.catch(function (err) { res.json(err) });
	};

	var RequestingDomainInSpecifiedWhitelist = function(requestingDomain, specifiedWhitelist) {
		if (specifiedWhitelist.indexOf(requestingDomain) !== -1) {
			return { origin: true };
		} else {
			return { origin: false };
		}
	};


	return {
		RequestingDomainWhitelistedForHealthAPI: RequestingDomainWhitelistedForHealthAPI,
		RequestingDomainWhitelistedForEmailAPI: RequestingDomainWhitelistedForEmailAPI,
		RequestingDomainWhitelistedForHRPositionsAPI: RequestingDomainWhitelistedForHRPositionsAPI,
		RequestingDomainWhitelistedForActiveDirectoryAPI: RequestingDomainWhitelistedForActiveDirectoryAPI,
		RequestingDomainInSpecifiedWhitelist: RequestingDomainInSpecifiedWhitelist

	};
}();



/*********************************************************************
	EXPORT FUNCTIONS
*********************************************************************/

module.exports = nesoCORS;