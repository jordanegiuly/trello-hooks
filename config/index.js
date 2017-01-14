'use strict';

module.exports = (env) => {
	let auth;
	if (env === 'development') {
		auth = require('../.auth.json');
	} else {
		auth = {
			TRELLO_APP_KEY: process.env.TRELLO_APP_KEY,
			TRELLO_SECRET: process.env.TRELLO_SECRET,
			TRELLO_TOKEN: process.env.TRELLO_TOKEN,
			LOG_ENTRIES_TOKEN: process.env.LOG_ENTRIES_TOKEN,
			ASANA_ACCESS_TOKEN: process.env.ASANA_ACCESS_TOKEN
		};
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
				callbackURL: 'https://spendesk-hooks.herokuapp.com/asana/hook/',
				workspaceId: '182877658733124',
				hooks: {
					feedbackProject: 195208910805602,
					feedbackTag: 246926738750671
				}
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
				callbackURL: 'https://fc400469.ngrok.io/asana/hook/',
				workspaceId: '182877658733124',
				hooks: {
					feedbackProject: 246912891949753,
					feedbackTag: 246926738750671
				}
			}
		}
	}

	return config[env];
}
