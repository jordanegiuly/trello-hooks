'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const logger = require('./logger.js')();

module.exports = (trello) => {

	function addMemberAndLabels(payload, config) {
		logger.debug({method: 'addMemberAndLabels', params: {
			cardName: payload.action.data.card.name,
			fullName: payload.action.memberCreator.fullName, 
		}});
		return addMember(trello, payload.action.data.card.id, payload.action.memberCreator.id)
		.then(() => {
			const labels = pickLabelsToAdd(config, payload.model.labelNames, payload.action.data.list.name);
			return addLabels(trello, payload.action.data.card.id, labels);
		})
	}

	return {
		addMemberAndLabels
	}
}

function addMember(trello, cardId, memberId) {
	return trello.postAsync('/1/cards/' + cardId + '/idMembers', { value: memberId });
}

function pickLabelsToAdd(config, labels, listName) {
	const labelNames = config.labels[listName];
	const result = [];
	_.forEach(labels, (name, color) => {
		if (name && labelNames.indexOf(name) >= 0) {
			result.push({color, name});
		}
	});
	return result;
}

function addLabels(trello, cardId, labels) {
	logger.debug({method: 'addLabels', params: {cardId, labels}})
	return bluebird.map(labels, label => {
		return trello.postAsync('/1/cards/' + cardId + '/labels', label);
	}, {concurrency: 1});
}
