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
					bugTag: 195240636254761,
					listings: [
						{
							name: 'feature',
							project: 247135399284257,
							tag: 235359699918433
						},
						{
							name: 'internal',
							project: 257514715599890,
							tag: 256984175450147
						},
						{
							name: 'improvement',
							project: 257514715599888,
							tag: 196716132093496
						}
					]
				}
			}
		},
		development: {
			auth: auth,
			trello: {
				auth: auth,
				appName: 'trelloHooks',
				callbackURL: 'https://28b0a6aa.ngrok.io/trellohooks',
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
				callbackURL: 'https://28b0a6aa.ngrok.io/asana/hook/',
				workspaceId: '182877658733124',
				hooks: {
					feedbackProject: 246912891949753,
					feedbackSection: 246936685519350,
					bugSection: 246936685519354,
					feedbackTag: 246926738750671,
					bugTag: 195240636254761,
					listings: [
						{
							name: 'internal',
							project: 268877375280987,
							tag: 256984175450147
						},
						{
							name: 'feature',
							project: 268877375280986,
							tag: 235359699918433
						}
					]
				}
			}
		}
	}

	return config[env];
}
