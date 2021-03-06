
// ----- PULL IN MODULES

const Twitter = require('twitter');
const moment = require('moment');

// ----- DEFINE SETTINGS FUNCTIONS

module.exports = {

	AddErrorToTwitter: errorData =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// try to post error to twitter
			try {
				// construct tweet based on errorData
				let errorTweet = moment().format('ddd, MM/DD, h:mm a');
				errorTweet += ` - ${process.env.appName} `;
				if (typeof (errorData.emergencyError) !== 'undefined' && errorData.emergencyError === true) {
					errorTweet += 'Emergency Error: ';
					if (typeof (errorData.emergencyErrorDetails) !== 'undefined') {
						errorTweet += `${errorData.emergencyErrorDetails}.`;
					} else {
						errorTweet += 'No details available.';
					}
				} else {
					errorTweet += 'Standard Error.';
				}
				// get a twitter client using neso's twitter settings
				const client = new Twitter({
					consumer_key: process.env.skipBHelpTwitterConsumerKey,
					consumer_secret: process.env.skipBHelpTwitterConsumerSecret,
					access_token_key: process.env.skipBHelpTwitterAccessTokenKey,
					access_token_secret: process.env.skipBHelpTwitterAccessTokenSecret,
				});
				// attempt post error to Twitter
				client.post('statuses/update', { status: errorTweet }, (tweetingError, tweet, response) => {
					// if there was an error posting to twitter
					if (tweetingError) {
						// construct custom error object
						const twitterErrorData = {
							error: true,
							twitterError: true,
							twitterErrorDetails: tweetingError,
						};
						// resolve the promise with the error data
						resolve(twitterErrorData);
					} else {
						resolve({ error: false, twitterError: false });
					}
				});
			} catch (tweetingError) {
				// construct custom error object
				const twitterErrorData = {
					error: true,
					twitterError: true,
					twitterErrorDetails: tweetingError,
				};
				// resolve the promise with the error data
				resolve(twitterErrorData);
			}
		})),

	ProcessError: errorData =>
		// return a new promise
		new Promise(((resolve, reject) => {
			// get a promise to add error to Twitter
			module.exports.AddErrorToTwitter(errorData)
				// if the promise is resolved with the result, then resolve this promise with the result
				.then((result) => { resolve(result); })
				// if the promise is rejected with an error, then reject this promise with an error
				.catch((error) => { reject(error); });
		}))
	,
};
