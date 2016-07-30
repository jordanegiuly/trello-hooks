'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');

module.exports = (trello) => {

	function addMemberAndLabels(payload, config) {
		console.log('addMemberAndLabels');
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
	console.log('addMember', cardId, memberId);
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
	console.log('pickLabelsToAdd', result);
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
//    { id: '5793492e433059b51d8e309b',
//      idMemberCreator: '54385505e1b7758081a8f0ef',
//      data: { board: [Object], list: [Object], card: [Object] },
//      type: 'createCard',
//      date: '2016-07-23T10:38:38.841Z',
//      memberCreator:
//       { id: '54385505e1b7758081a8f0ef',
//         avatarHash: 'c52a33c039ceccff339447166feaf2d5',
//         fullName: 'Jordane G',
//         initials: 'JG',
//         username: 'jordaneg' } } }

