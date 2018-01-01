
/*********************************************************************
	PULL IN MODULES
*********************************************************************/

// enable use of "moment" node module; this provides date and time utility functions
const moment = require('moment');



/*********************************************************************
	DEFINE UTILITIES FUNCTIONS
*********************************************************************/

module.exports = {

	"ReturnFormattedDateTime": ({ dateTimeString, incomingFormat, returnFormat, determineYearDisplayDynamically }) => {
		// config locale
		moment.locale('en');
		moment.suppressDeprecationWarnings = true;
		// set up vars
		var retVal = '';
		// if dateTimeString is set to 'nowLocal', reset to string representing current datetime
		if (dateTimeString == 'nowLocal') {
			dateTimeString = moment().format();
		}
		// if dateTimeString is set to 'nowUTC', reset to string representing current datetime
		if (dateTimeString == 'nowUTC') {
			dateTimeString = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		}
		// if need to determine year display dynamically
		//		(essentially, we'll only display year if it's not the current year)
		if (typeof(determineYearDisplayDynamically) != "undefined") {
			if (determineYearDisplayDynamically == 1) {
				let dateTimeStringYear = '';
				let displayYear = '';

				// if there's an incoming format
				if (incomingFormat != null) {
					// use that to to parse dateTimeString's year
					dateTimeStringYear = moment(dateTimeString, incomingFormat).format('YYYY');
					// otherwise
				} else {
					// assume dateTimeString is in ISO format
					dateTimeStringYear = moment(dateTimeString).format('YYYY');
				}
				// if dateTimeString's year != the current year
				if (moment(dateTimeString).format('YYYY') != moment().format('YYYY')) {
					// set flag to display year
					displayYear = 1;
					// otherwise
				} else {
					// set flag to not display year
					displayYear = 0;
				}
				// if displayYear == 1 and returnFormat doesn't contain the year
				if (displayYear == 1 && this.StrInStr({ "haystack": returnFormat, "needle": ", YYYY", "flag": 0 }) == false) {
					// add the year to returnFormat
					returnFormat += ', YYYY';
				}
				// if displayYear == 0 and returnFormat DOES contain the year
				if (displayYear == 0 && this.StrInStr({ "haystack": returnFormat, "needle": ", YYYY", "flag": 0 }) != false) {
					// remove the year from returnFormat
					returnFormat = ReplaceAll(', YYYY', '', returnFormat);
				}
			}
		}
		// if incoming format is null, assume dateTimeString is in iso format
		if (incomingFormat == null) {
			// if return format is null
			if (returnFormat == null) {
				// use iso format to format dateTimeString
				retVal += moment(dateTimeString, incomingFormat).format();
				// if return format is not null
			} else {
				// use return format to format dateTimeString
				retVal += moment(dateTimeString, incomingFormat).format(returnFormat);
			}
		// if incoming format is not null, use it to parse dateTimeString
		} else {
			// if incomingFormat contains ', YYYY' and dateTimeString doesn't end with that value and determineYearDisplayDynamically == 1
			//  (E.g., incomingFormat == 'MMMM D, YYYY' and dateTimeString is only 'February 14'
			if (this.StrInStr({ "haystack": incomingFormat, "needle": ", YYYY" }) != false && this.StrInStr({ "haystack": dateTimeString, "needle": ", 2" }) == false && typeof(determineYearDisplayDynamically) != "undefined" && determineYearDisplayDynamically == 1) {
				// augment with the current year
				//  (since determineYearDisplayDynamically == 1, should be safe assumption (until it isn't))
				dateTimeString += ', ' + moment().format('YYYY');
			}
			// if return format is null
			if (returnFormat == null) {
				// use iso format to format dateTimeString
				retVal += moment(dateTimeString, incomingFormat).format();
			// if return format is not null
			} else {
				// use return format to format dateTimeString
				retVal += moment(dateTimeString, incomingFormat).format(returnFormat);
			}
		}
		return retVal;
	},

	

	/*
		description: given an array of arrays in which the first array contains the keys and the other arrays contain values,
		return an array of objects with the values labeled with the keys; see illustration below

		initial use case: parsing an Excel worksheet results in an array of arrays, but we need an array of objects 
		to store in Mongo

		given: [ [ "foo", "bar", "woot" ], [ 2, 4, 6 ], [ 102, 104, 106 ] ]
		return: [
			{
				"foo": 2,
				"bar": 4,
				"woot": 6
			}, {
				"foo": 102,
				"bar": 104,
				"woot": 106
			}
		]
	*/
	"ReturnArrayOfArraysWithFirstArrayHeaderAsArrayOfMappedJSONObjects": (arrayOfArrays) => {
		// set up vars
		var arrayOfObjects = [];
		var keysContent = [];
		// for each array in the array of arrays
		for (const [primaryIndex, primaryValue] of arrayOfArrays.entries()) {
			if (primaryIndex === 0) {
				const primaryElementContent = arrayOfArrays[primaryIndex];
				keysContent = primaryElementContent;
			} else {
				const primaryElementContent = arrayOfArrays[primaryIndex];
				const primaryElementContentAsJSONObject = {};

				for (const [secondaryIndex, secondaryValue] of primaryElementContent.entries()) {
					const secondaryElementContent = primaryElementContent[secondaryIndex];
					primaryElementContentAsJSONObject[keysContent[secondaryIndex]] = secondaryElementContent;
				}
				arrayOfObjects.push(primaryElementContentAsJSONObject);
			}
		}
	},

	

 	"StrInStr": ({ haystack, needle, flag }) => {

		var position = 0;
		haystack = haystack + '';
		needle = needle + '';
		position = haystack.indexOf(needle);

		if (position === -1) {
			return false;
		} else {
			if (typeof(flag) != "undefined") {
				if (flag === 1) {
					// return from beginning of string to beginning of needle
					return haystack.substr(0, position);
				} else if (flag === 2) {
					// return ?
					return haystack.slice(needle.length);
				} else if (flag === 3) {
					// return from needle to end of string, needle-exclusive
					return haystack.slice(position + needle.length);
				}
			} else {
				// return from needle to end of string, needle-inclusive
				return haystack.slice(position);
			}
		}
	}
};