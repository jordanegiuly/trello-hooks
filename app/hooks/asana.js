'use strict';
const _ = require('lodash');

const TASK = 'task';
const ADDED = 'added';
const CHANGED = 'changed';
const NEW_TASK_IN_FEEDBACK = 'new task in feedback';
const SUBTASK_ADDED = 'subtask added';
let asana, config;

module.exports = (_asana, _config) => {
  asana = _asana; config = _config;
  return (events) => {
    console.log('events', events);
    const {eventType, payload} = parseEvents(events);
    console.log('parseEvents', {eventType, payload});
    if (eventType === NEW_TASK_IN_FEEDBACK) {
      return newTaskInFeedback(payload);
    }
    if (eventType === SUBTASK_ADDED) {
      return subTaskAdded(payload)
    }
    return new Promise((resolve, reject) => {
      return resolve({});
    });
  };
}

function parseEvents(events) {
  let result = {};
  let changedTask;
  _.forEach(events, event => {
    if (event.type === TASK && event.action === CHANGED) {
      changedTask = event.resource;
    }
    if (event.type === TASK && event.action === ADDED && event.parent === config.feedbackProject) {
      result = {
        eventType: NEW_TASK_IN_FEEDBACK,
        payload: event
      }
    }
    if (event.type === TASK && event.action === ADDED && event.parent === changedTask) {
      result = {
        eventType: SUBTASK_ADDED,
        payload: event
      }
    }
  });
  return result;
}

function newTaskInFeedback(payload) {
  const html_notes = `<strong>Raw feedback:</strong> [
TODO
]
<strong>Informant type:</strong>
- [ ] Team member
- [ ] Customer
- [ ] Opportunity
<strong>Informant info:</strong>
- Name: [TODO]
- Company name: [TODO]
<strong>Feedback source:</strong>
- [ ] Meeting
- [ ] Phone
- [ ] Mail
- [ ] Intercom
- [ ] Slack
- [ ] Other
<strong>Link to resource (Intercom, Slack):</strong>[
TODO
]
<strong>Product scope:</strong>
- [ ] WebApp
- [ ] Mobile
- [ ] Plugin
- [ ] Static website
`;

  return asana.tasks.update(payload.resource, { html_notes })
  .then(() => {
    return asana.tasks.addTag(payload.resource, {tag: config.feedbackTag });
  })
}


function subTaskAdded(payload) {
  return asana.tasks.findById(payload.resource)
  .then(task => {
    if (task.name.indexOf('https://app.asana.com/') >= 0) {
      console.log('subtask with asana name');
      const id = task.name.split('/').slice(-1)[0];
      console.log('last', id);
      return asana.tasks.setParent(id, payload.parent)
      .then(() => {
        return asana.tasks.delete(payload.resource);
      })
    }
  })
}


// { events:
//    [ { resource: 246912891949753,
//        user: 182877657874434,
//        type: 'project',
//        action: 'changed',
//        created_at: '2017-01-14T11:43:57.617Z',
//        parent: null },
//      { resource: 246913600683843,
//        user: 182877657874434,
//        type: 'task',
//        action: 'added',
//        created_at: '2017-01-14T11:43:57.586Z',
//        parent: 246912891949753 },
//      { resource: 246913600683844,
//        user: 182877657874434,
//        type: 'story',
//        action: 'added',
//        created_at: '2017-01-14T11:43:57.612Z',
//        parent: 246913600683843 } ] }

