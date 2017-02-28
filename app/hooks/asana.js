'use strict';
const _ = require('lodash');

const TASK = 'task';
const ADDED = 'added';
const CHANGED = 'changed';
const REMOVED = 'removed';
const NEW_TASK_IN_FEEDBACK = 'new task in feedback';
const NEW_TASK_IN_LISTING = 'new task in listing';
const SUBTASK_ADDED = 'subtask added';

let asana, config;

module.exports = (_asana, _config) => {
  asana = _asana; config = _config;
  return (projectId, events) => {
    return parseEvents(projectId, events)
    .then(({eventType, payload, params}) => {
      if (eventType === NEW_TASK_IN_FEEDBACK) {
        return newTaskInFeedback(payload);
      }
      if (eventType === SUBTASK_ADDED) {
        return subTaskAdded(payload, params)
      }
      if (eventType === NEW_TASK_IN_LISTING) {
        return newTaskInListing(payload, params);
      }
      return new Promise((resolve, reject) => {
        return resolve({});
      });
    });
  };
}

function projectInListing(project, listings) {
  return _.find(listings, listing => {
    return listing.project === project;
  });
}


function parseEvents(projectId, events) {
  const promises = _.map(events, event => {
    return new Promise((resolve, reject) => {
      if (event.type === TASK && event.action === ADDED && event.parent === config.feedbackProject) {
        return resolve({
          eventType: NEW_TASK_IN_FEEDBACK,
          payload: event
        });
      }
      const listing = projectInListing(event.parent, config.listings);
      if (event.type === TASK && event.action === ADDED && listing) {
        return asana.tasks.findById(event.resource)
        .then(task => {
          if (isFeedbackTask(task)) {
            return resolve({});
          }
          else {
            return resolve({
              eventType: NEW_TASK_IN_LISTING,
              payload: event,
              params: listing
            });
          }
        })
        .catch(err => {
          console.log('asana.tasks.findById', event.resource, err.message);
          return resolve({});
        });
      };
      if (event.type === TASK && event.action === ADDED) {
        return asana.tasks.findById(event.parent)
        .then(parent => {
          return resolve({
            eventType: SUBTASK_ADDED,
            payload: event,
            params: parent
          });
        })
        .catch(err => {
          console.log('asana.tasks.findById', event.parent, err.message);
          return resolve({});
        })
      }
      return resolve({});
    });
  });
  return Promise.all(promises)
  .then(results => {
    let result = {};
    _.forEach(results, res => {
      if (res.eventType) {
        result = res;
        return;
      }
    });
    return result;
  });
}


function isFeedbackTask(task) {
  return !!_.find(task.tags, tag => {
    return tag.id === config.feedbackTag;
  });
}

function newTaskInFeedback(payload) {
  console.log('newTaskInFeedback', payload);
  return asana.tasks.findById(payload.resource)
  .then(task => {
    const membership = _.find(task.memberships, _membership => {
      return (_membership.project.id === config.feedbackProject);
    });
    if (membership && membership.section) {
      let {html_notes, tag} = get_html_notes(membership.section.id);

      return asana.tasks.update(payload.resource, { html_notes })
      .then(() => {
        return asana.tasks.addTag(payload.resource, {tag: tag });
      })
      .catch(err => {
        console.log('asana.tasks.update', payload.resource, err.message);
        return new Promise((resolve, reject) => {
          return resolve({});
        });
      });
    }
    return new Promise((resolve, reject) => {
      return resolve({});
    });
  })
  .catch(err => {
    console.log('newTaskInFeedback', payload.resource, err.message);
    return new Promise((resolve, reject) => {
      return resolve({});
    });
  });
}

function subTaskAdded(payload, parent) {
  console.log('subTaskAdded', payload, parent);
  return asana.tasks.findById(payload.resource)
  .then(task => {
    console.log('task', task);
    if (task.name.indexOf('https://app.asana.com/') >= 0) {
      const id = task.name.split('/').slice(-1)[0];
      return asana.tasks.setParent(id, payload.parent)
      .then(() => {
        return asana.tasks.delete(payload.resource);
      })
    }
    if (isFeedbackTask(task)) {
      return handleSubTaskFeedback(task, parent)
    }
    if (isUpvote(parent)) {
      return handleUpvote(task, parent)
    }
  })
  .catch(err => {
    console.log('subTaskAdded', payload.resource, err.message);
    return new Promise((resolve, reject) => {
      return resolve({});
    });
  });
}

function isUpvote(parent) {
  return parent.name.indexOf('Upvotes') >= 0;
}

function handleSubTaskFeedback(task, parent) {
  console.log('handleSubTaskFeedback', task, parent);
  const { feedback, userName, userEmail, company } = parseDescription(task.notes);
  return asana.tasks.update(task.id, {name: [userEmail, company, task.name].join(', ')})
  .then(() => {
    return updatePriority(parent.parent, task)
  })
}

function handleUpvote(task, parent) {
  console.log('handleUpvote', task, parent);
  return updatePriority(parent.parent, task);
}

function updatePriority(task, feedback) {
  console.log('updatePriority', task, feedback)
  let {priority, name} = parsePriority(task.name);
  priority = priority - 1;
  if (priority < 10) {
    priority = '00' + priority;
  }
  if (priority < 100) {
    priority = '0' + priority;
  }
  return asana.tasks.update(task.id, {name: '[' + priority + '] ' + name});
}

function parsePriority(name) {
  const left = name.indexOf('['); const right = name.indexOf(']');
  if (left === 0 && right > 0) {
    const priority = parseInt(name.substring(1, right));
    if (priority) {
      return {priority, name: name.substring(right + 1, name.length)}
    }
  } else {
    return {priority: 100, name}
  }
}

function parseDescription(description) {
  const {info: feedback, desc: desc} = getInfo(description, '1.');
  const {info: userName, desc: desc1} = getInfo(desc, '3.1.');
  const {info: userEmail, desc: desc2} = getInfo(desc1, '3.2.');
  const {info: company, desc: desc3} = getInfo(desc2, '3.3.');
  return {
    feedback, userName, userEmail, company
  }
}

function getInfo(description, start) {
  description = description.substring(description.indexOf(start));
  const endIndex = description.indexOf(']');
  return {
    info: description.substring(description.indexOf('[') + 1, endIndex),
    desc: description.substring(endIndex)
  };
}


function newTaskInListing(payload, listing) {
  console.log('newTaskInListing', payload, listing);
  const subtaskList = ['Teamwork: Product', 'Teamwork: Design', 'Teamwork: Marketing', 'Teamwork: Dev', 'Feedback =>', 'Upvotes =>'];
  const promises = _.map(subtaskList, subtask => {
    return asana.tasks.addSubtask(payload.resource, {name: subtask})
  });
  return asana.tasks.addTag(payload.resource, {tag: listing.tag })
  .then(() => {
    return Promise.all(promises)
  })
  .catch(err => {
    console.log('newTaskInListing', payload.resource, err.message);
    return new Promise((resolve, reject) => {
      return resolve({});
    });
  })
}


function get_html_notes(section_id) {
  let html_notes = '';
  let tag;
  if (section_id === config.feedbackSection) {
    html_notes = `<strong>1. Raw feedback:</strong> [
TODO
]
<strong>2. Informant type:</strong>
- [ ] 2.1. Team member
- [ ] 2.2. Customer
- [ ] 2.3. Opportunity
<strong>3. Informant info:</strong>
- 3.1. Name: [TODO]
- 3.2. Contact (email): [TODO]
- 3.3. Company name: [TODO]
- 3.4. Company plan: [TODO]
<strong>4. Link to resource</strong> (Intercom, Slack, if any):[
TODO
]
`;
    tag = config.feedbackTag;
  }

  if (section_id === config.bugSection) {
    html_notes = `<strong>1. Description</strong> (please include screenshots and console content): [
TODO
]
<strong>2. User email</strong> (if any): [
TODO
]
<strong>3. Resource id</strong> (request, payment, if any): [
TODO
]
<strong>4. Device</strong> (browser version, mobile): [
TODO
]
<strong>5. Link to resource</strong> (Intercom, Slack, if any): [
TODO
]`;
    tag = config.bugTag;
  }
  return {html_notes, tag};
}
