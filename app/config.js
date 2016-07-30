'use strict';
const auth = require('../.auth.json');

module.exports = (env) => {
	return config[env];
}

const config = {
	production: {
		appName: 'trelloHooks',
		callbackURL: 'http://ec2-52-209-21-252.eu-west-1.compute.amazonaws.com/trellohooks',
		boards: [
			'Spendesk - Feedback'
		],
		auth: auth		
	},
	development: {
		appName: 'trelloHooks',
		callbackURL: 'http://745f858c.ngrok.io/trellohooks',
		boards: [
			'Personal tasks'
		],
		auth: auth
	}
}
