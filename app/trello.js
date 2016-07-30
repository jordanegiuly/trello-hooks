'use strict';

const _ = require('lodash');
const Trello = require('node-trello');
const bluebird = require('bluebird');
const request = require('request');
bluebird.promisifyAll(request);

let trello;

module.exports = (config) => {

	trello = trello || init(config.auth);
	const hooks = require('./hooks.js')(trello);

	function createWebhooks() {
		return getBoardIds(config.boards)
		.then(boardIds => {
			return Promise.all(_.map(boardIds, boardId => {
				return createWebhook(config.auth, config.appName, config.callbackURL, boardId);
			}))
		})
		.then(result => {
			console.log('Done creating ' + result.length + ' webhooks.');
		});
	}

	function deleteWebhooks() {
		return getWebhooks(config.auth, config.appName)
		.then(webhooks => {
			return Promise.all(_.map(webhooks, webhook => {
				return trello.delAsync('/1/webhooks/' + webhook.id);
			}));
		})
		.then(result => {
			console.log('Done deleting ' + result.length + ' webhooks.');
		})
	}

	function handlePayload(payload) {
		console.log(['Payload', payload.action.type, payload.model.name].join(' - '));
		return new Promise((resolve, reject) => {
			_.forEach(hooks, hook => {
				if (hook.trigger.actionType === payload.action.type &&
					hook.trigger.modelName === payload.model.name) {
					return hook.action(payload)
					.then(resolve);
				}
			});
			// resolve();
		});
	}

	return {
		createWebhooks,
		deleteWebhooks,
		handlePayload
	}
}

function init(auth) {
	console.log('INIT TRELLO');
	const trello = new Trello(auth.TRELLO_APP_KEY, auth.TRELLO_TOKEN);
	bluebird.promisifyAll(trello);
	return trello;
}

function me(options) {
	const stringifiedOptions = stringifyOptions(options);
	return trello.getAsync(`/1/members/me${stringifiedOptions}`);
}

function getWebhooks(auth, description) {
	return request.getAsync('https://api.trello.com/1/tokens/' + auth.TRELLO_TOKEN + '/webhooks/?key=' + auth.TRELLO_APP_KEY)
	.then(res => {
		if (!(res.statusCode === 200)) {
			console.log(res.statusCode);
			throw res.body;
		}
		const webhooks = JSON.parse(res.body);
		return _.filter(webhooks, webhook => {
			return (webhook.description == description);
		});
	})
	.catch(err => {
		console.error('err', err);
	});
}

function createWebhook(auth, appName, callbackURL, boardId) {
	const url = 'https://api.trello.com/1/tokens/' + auth.TRELLO_TOKEN + '/webhooks/?key=' + auth.TRELLO_APP_KEY;
	return request.postAsync(url, { form: {
		description: appName,
		callbackURL: callbackURL,
		idModel: boardId
	}})
	.then(res => {
		if (!(res.statusCode === 200)) {
			console.log(res.statusCode);
			throw res.body;
		}
		return true;
	})
	.catch(err => {
		console.error('err', err);
	});
}

function getBoardIds(boardNames) {
	// TODO check agains organization
	boardNames = boardNames || ['Personal tasks'];
	const options = {
		filter: ['open'],
		fields: ['idOrganization', 'name', 'url']
	}
	const stringifiedOptions = stringifyOptions(options);
	return trello.getAsync(`/1/members/me/boards${stringifiedOptions}`)
	.then(boards => {
		return _.filter(boards, board => {
			return (boardNames.indexOf(board.name) >= 0)
				&& (!board.closed);
		})
		.map(board => {
			return board.id;
		});
	});
}

function stringifyOptions(options) {
	options = options || {};
	let result = '';
	const array = [];
	_.forEach(options, (values, arg) => {
		array.push(arg + '=' + values.join(','));
	});
	if (array.length > 0) {
		result = '?' + array.join('&');
	}
	return result;
}
