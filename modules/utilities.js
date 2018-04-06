
// ----- PULL IN MODULES

const moment = require('moment');

// ----- DEFINE UTILITIES FUNCTIONS

module.exports = {

	ReplaceAll: (needle, replacementNeddle, haystack) => haystack.replace(new RegExp(needle, 'g'), replacementNeddle),

	ReturnFormattedDateTime: ({
		incomingDateTimeString, incomingFormat, incomingReturnFormat, determineYearDisplayDynamically,
	}) => {
		// config locale
		moment.locale('en');
		moment.suppressDeprecationWarnings = true;
		// set up vars
		let returnValue = '';
		let dateTimeStringToUse = '';
		let returnFormatToUse = incomingReturnFormat;
		// if incomingDateTimeString is set to 'nowLocal', reset to string representing current datetime
		if (incomingDateTimeString === 'nowLocal') {
			dateTimeStringToUse = moment().format();
			// otherise, if incomingDateTimeString is 'nowUTC', use string representing current datetime
		} else if (incomingDateTimeString === 'nowUTC') {
			dateTimeStringToUse = moment().format('YYYY-MM-DDTHH:mm:ssZ');
		} else {
			dateTimeStringToUse = incomingDateTimeString;
		}
		// if need to determine year display dynamically
		//		(essentially, we'll only display year if it's not the current year)
		if (typeof (determineYearDisplayDynamically) !== 'undefined') {
			if (determineYearDisplayDynamically === 1) {
				let displayYear = '';
				// if dateTimeStringToUse's year != the current year
				if (moment(dateTimeStringToUse).format('YYYY') !== moment().format('YYYY')) {
					// set flag to display year
					displayYear = 1;
					// otherwise
				} else {
					// set flag to not display year
					displayYear = 0;
				}
				// if displayYear == 1 and incomingReturnFormat doesn't contain the year
				if (displayYear === 1 && this.StrInStr({ haystack: incomingReturnFormat, needle: ', YYYY', flag: 0 }) === false) {
					// add the year to returnFormatToUse
					returnFormatToUse += ', YYYY';
				}
				// if displayYear == 0 and incomingReturnFormat DOES contain the year
				if (displayYear === 0 && this.StrInStr({ haystack: incomingReturnFormat, needle: ', YYYY', flag: 0 }) !== false) {
					// remove the year from returnFormat
					returnFormatToUse = module.exports.ReplaceAll(', YYYY', '', returnFormatToUse);
				}
			}
		}
		// if incoming format is null, assume dateTimeStringToUse is in iso format
		if (incomingFormat == null) {
			// if incomingReturnFormat is null
			if (incomingReturnFormat == null) {
				// use iso format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format();
				// if return format is not null
			} else {
				// use return format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format(returnFormatToUse);
			}
			// if incoming format is not null, use it to parse dateTimeStringToUse
		} else {
			/** if incomingFormat contains ', YYYY' and dateTimeStringToUse doesn't end with that 
			 * value and determineYearDisplayDynamically == 1
			 * (E.g., incomingFormat == 'MMMM D, YYYY' and dateTimeStringToUse is only 'February 14'
 			 */
			if (this.StrInStr({ haystack: incomingFormat, needle: ', YYYY' }) !== false && this.StrInStr({ haystack: dateTimeStringToUse, needle: ', 2' }) === false && typeof (determineYearDisplayDynamically) !== 'undefined' && determineYearDisplayDynamically === 1) {
				// augment with the current year
				//  (since determineYearDisplayDynamically == 1, should be safe assumption (until it isn't))
				dateTimeStringToUse += `, ${moment().format('YYYY')}`;
			}
			// if return format is null
			if (incomingFormat == null) {
				// use iso format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format();
				// if return format is not null
			} else {
				// use return format to format dateTimeStringToUse
				returnValue += moment(dateTimeStringToUse, incomingFormat).format(returnFormatToUse);
			}
		}
		return returnValue;
	},

	/**
	 * description: given an array of arrays in which the first array contains the keys and the
	 * other arrays contain values, return an array of objects with the values labeled with the
	 * keys; see illustration below
	 * 
	 * initial use case: parsing an Excel worksheet results in an array of arrays, but we 
	 * need an array of objects to store in Mongo
	 * 
	 * given: [ [ "foo", "bar", "woot" ], [ 2, 4, 6 ], [ 102, 104, 106 ] ]
	 * return: [
	 * 		{
	 * 			"foo": 2,
	 * 			"bar": 4,
	 * 			"woot": 6
	 * 		},{
	 * 			"foo": 102,
	 * 			"bar": 104,
	 * 			"woot": 106
	 * 		}
	 * ]
	 */
	ReturnArrayOfArraysWithFirstArrayHeaderAsArrayOfMappedJSONObjects: (arrayOfArrays) => {
		// set up vars
		const arrayOfObjects = [];
		let keysContent = [];
		// for each array in the array of arrays
		arrayOfArrays.forEach((primaryItem, primaryIndex) => {
			if (primaryIndex === 0) {
				const primaryElementContent = arrayOfArrays[primaryIndex];
				keysContent = primaryElementContent;
			} else {
				const primaryElementContent = arrayOfArrays[primaryIndex];
				const primaryElementContentAsJSONObject = {};

				primaryElementContent.forEach((secondaryItem, secondaryIndex) => {
					const secondaryElementContent = primaryElementContent[secondaryIndex];
					primaryElementContentAsJSONObject[keysContent[secondaryIndex]] = secondaryElementContent;
				});
				arrayOfObjects.push(primaryElementContentAsJSONObject);
			}
		});

		return arrayOfObjects;
	},

	StrInStr: ({ incomingHaystack, incomingNeedle, flag }) => {
		// let position = 0;
		const haystackToUse = `${incomingHaystack}`;
		const needleToUse = `${incomingNeedle}`;
		const position = haystackToUse.indexOf(needleToUse);
		let returnValue = 0;

		if (position === -1) {
			return false;
		}
		if (typeof (flag) !== 'undefined') {
			if (flag === 1) {
				// return from beginning of string to beginning of needleToUse
				returnValue = haystackToUse.substr(0, position);
			} else if (flag === 2) {
				// return ?
				returnValue = haystackToUse.slice(needleToUse.length);
			} else if (flag === 3) {
				// return from needleToUse to end of string, needleToUse-exclusive
				returnValue = haystackToUse.slice(position + needleToUse.length);
			}
		} else {
			// return from needleToUse to end of string, needleToUse-inclusive
			returnValue = haystackToUse.slice(position);
		}

		return returnValue;
	},
};
