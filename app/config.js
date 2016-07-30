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
		auth: auth,
		hooks: [
			{
				trigger: {
					actionType: 'createCard',
					modelName: 'Spendesk - Feedback'
				},
				action: 'addMemberAndLabel',
				config: {
					labels: {
						'Customer feature requests': ['Customer feature', '# user story #'],
						'Team feature requests': ['Team feature', '# user story #'],
						'Improvements': ['Improvment', '# task #'],
						'Bugs': ['Bug', '# task #'],
						'Wording / UI issues': ['Wording / UI', '# task #']
					}					
				}
			}
		]	
	},
	development: {
		appName: 'trelloHooks',
		callbackURL: 'http://660f9b68.ngrok.io/trellohooks',
		boards: [
			'Personal tasks'
		],
		auth: auth,
		hooks: [
			{
				trigger: {
					actionType: 'createCard',
					modelName: 'Personal tasks'
				},
				action: 'addMemberAndLabel',
				config: {
					labels: {
						'TODO TODAY': ['Assigned'],
						'DOING': ['In progress', 'Important']
					}					
				}
			}
		]
	}
}
