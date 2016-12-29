'use strict';
const auth = require('../.auth.json');

module.exports = (env) => {
	return config[env];
}

const config = {
	production: {
		auth: auth,
		trello: {
			auth: auth,
			appName: 'trelloHooks',
			callbackURL: 'http://ec2-52-209-21-252.eu-west-1.compute.amazonaws.com/trellohooks',
			boards: [
				'Spendesk - Feedback'
			],
			hooks: [
				{
					trigger: {
						actionType: 'createCard',
						modelName: 'Spendesk - Feedback'
					},
					action: 'addMemberAndLabels',
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
		asana: {
			auth: auth,
			callbackURL: 'https://ec2-52-209-21-252.eu-west-1.compute.amazonaws.com/asana/hook/',
			workspaceId: '182877658733124'
		}
	},
	development: {
		auth: auth,
		trello: {
			auth: auth,
			appName: 'trelloHooks',
			callbackURL: 'https://42542634.ngrok.io/trellohooks',
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
					action: 'addMemberAndLabels',
					config: {
						labels: {
							'TODO TODAY': ['Assigned'],
							'DOING': ['In progress', 'Important']
						}
					}
				}
			]
		},
		asana: {
			auth: auth,
			callbackURL: 'https://42542634.ngrok.io/asana/hook/',
			workspaceId: '182877658733124'
		}
	}
}
