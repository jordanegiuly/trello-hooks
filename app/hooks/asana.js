'use strict';
const _ = require('lodash');

const TASK = 'task';
const ADDED = 'added';
const CHANGED = 'changed';
const NEW_TASK_IN_FEEDBACK = 'new task in feedback';
const NEW_TASK_IN_BUG = 'new task in BUG';
const SUBTASK_ADDED = 'subtask added';

let asana, config;

module.exports = (_asana, _config) => {
  asana = _asana; config = _config;
  return (projectId, events) => {
    console.log('events', events);
    const {eventType, payload} = parseEvents(projectId, events);
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

function parseEvents(projectId, events) {
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
  return asana.tasks.findById(payload.resource)
  .then(task => {
    const membership = _.find(task.memberships, _membership => {
      return (_membership.project.id === config.feedbackProject);
    });
    if (membership && membership.section) {
      let html_notes, tag;

      if (membership.section.id === config.feedbackSection) {
        html_notes = `<strong>Raw feedback:</strong> [
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
- [ ] Static website`;
        tag = config.feedbackTag;
      }

      if (membership.section.id === config.bugSection) {
        html_notes = `<strong>Description</strong> (please include screenshots and console content): [
TODO
]
<strong>User id (if any):</strong> [
TODO
]
<strong>Resource id (ex: request, if any):</strong> [
TODO
]
<strong>Device (browser version, mobile):</strong> [
TODO
]
<strong>Link to resource (Intercom, Slack):</strong> [
TODO
]
<strong>Bug source:</strong>
- [ ] Meeting
- [ ] Phone
- [ ] Mail
- [ ] Intercom
- [ ] Slack
- [ ] Other`;
        tag = config.bugTag;
      }
      return asana.tasks.update(payload.resource, { html_notes })
      .then(() => {
        return asana.tasks.addTag(payload.resource, {tag: tag });
      })
      .catch(err => {
        console.log(err.message);
      });
    }
    return new Promise((resolve, reject) => {
      return resolve({});
    });
  });
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
