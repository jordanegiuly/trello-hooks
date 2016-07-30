'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const logger = require('./logger.js')();

module.exports = (trello) => {

	function addMemberAndLabels(payload, config) {
		logger.debug('addMemberAndLabels');
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
	logger.debug('addMember', cardId, memberId);
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
	logger.debug('pickLabelsToAdd', result);
	return result;
}

function addLabels(trello, cardId, labels) {
	return bluebird.map(labels, label => {
		return trello.postAsync('/1/cards/' + cardId + '/labels', label);
	}, {concurrency: 1});
}

// { model:
//    { id: '5439112fcfc8ee235de88f9c',
//      name: 'Personal tasks',
//      desc: '',
//      descData: null,
//      closed: false,
//      idOrganization: null,
//      pinned: false,
//      url: 'https://trello.com/b/dkgVNIGv/personal-tasks',
//      shortUrl: 'https://trello.com/b/dkgVNIGv',
//      prefs:
//       { permissionLevel: 'private',
//         voting: 'disabled',
//         comments: 'members',
//         invitations: 'members',
//         selfJoin: true,
//         cardCovers: false,
//         cardAging: 'regular',
//         calendarFeedEnabled: false,
//         background: 'blue',
//         backgroundImage: null,
//         backgroundImageScaled: null,
//         backgroundTile: false,
//         backgroundBrightness: 'dark',
//         backgroundColor: '#0079BF',
//         canBePublic: true,
//         canBeOrg: true,
//         canBePrivate: true,
//         canInvite: true },
//      labelNames:
//       { green: 'Done',
//         yellow: 'To be validated',
//         orange: 'Blocked',
//         red: 'Important',
//         purple: 'In progress',
//         blue: 'Assigned',
//         sky: 'Background task',
//         lime: '',
//         pink: '',
//         black: '' } },
//   action:
//    { id: '579cdc3f99435ec818f8a7d3',
//      idMemberCreator: '54385505e1b7758081a8f0ef',
//      data:
//       { label: [Object],
//         board: [Object],
//         card: [Object],
//         text: 'Done',
//         value: 'green' },
//      type: 'addLabelToCard',
//      date: '2016-07-30T16:56:31.241Z',
//      memberCreator:
//       { id: '54385505e1b7758081a8f0ef',
//         avatarHash: 'c52a33c039ceccff339447166feaf2d5',
//         fullName: 'Jordane G',
//         initials: 'JG',
//         username: 'jordaneg' } } }