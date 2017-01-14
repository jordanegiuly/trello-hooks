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
					feedbackProject: 246935434971281,
					feedbackSection: 246936685519395,
					bugSection: 246936685519393,
					feedbackTag: 246926738750671,
					bugTag: 195240636254761
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
					feedbackSection: 246936685519350,
					bugSection: 246936685519354,
					feedbackTag: 246926738750671,
					bugTag: 195240636254761
				}
			}
		}
	}

	return config[env];
}
