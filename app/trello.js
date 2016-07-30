'use strict';

const _ = require('lodash');
const Trello = require('node-trello');
const bluebird = require('bluebird');
const request = require('request');
bluebird.promisifyAll(request);
const logger = require('./logger.js')();

let trello;

module.exports = (config) => {

	trello = trello || init(config.auth);
	const hookActions = require('./hooks.js')(trello);

	function createWebhooks() {
		return getBoardIds(config.boards)
		.then(boardIds => {
			return Promise.all(_.map(boardIds, boardId => {
				return createWebhook(config.auth, config.appName, config.callbackURL, boardId);
			}))
		})
		.then(result => {
			logger.info('Done creating ' + result.length + ' webhooks.');
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
			logger.info('Done deleting ' + result.length + ' webhooks.');
		})
	}

	function handlePayload(payload) {
		logger.debug(payload.model.name + ' ' + payload.action.type);
		return new Promise((resolve, reject) => {
			_.forEach(config.hooks, hook => {
				if (hook.trigger.actionType === payload.action.type &&
					hook.trigger.modelName === payload.model.name) {
					return hookActions[hook.action](payload, hook.config)
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
			logger.warning(res.statusCode, res.body);
			return;
		}
		const webhooks = JSON.parse(res.body);
		return _.filter(webhooks, webhook => {
			return (webhook.description == description);
		});
	})
	.catch(logger.err);
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
			logger.warning(res.statusCode, res.body);
			return;
		}
		return true;
	})
	.catch(logger.err);
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
