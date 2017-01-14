'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const request = require('request');
bluebird.promisifyAll(request);
const logger = require('./logger.js')();
const Asana = require('asana');
// const auth = require('./.auth.json').ASANA_ACCESS_TOKEN;

let asana;

module.exports = (config) => {
  asana = asana || init(config.auth);
  // const hookActions = require('./hooks.js')(asana);

  function createWebhook(id) {
    console.log('createWebhook', config.callbackURL + id);
    return asana.webhooks.create(id, config.callbackURL + id, {}) // TODO
  }

  function getHook(resourceId) {
    return asana.webhooks.getAll(config.workspaceId) // TODO
    .then(res => {
      return _.find(res.data, (hook) => {
        return (hook.resource.id == resourceId);
      });
    })
  }

  function deleteHook(resourceId) {
    return getHook(resourceId)
    .then(hook => {
      if (hook) {
        return asana.webhooks.deleteById(hook.id);
      }
      return;
    });
  }

  // function createWebhook() {
  //   return getBoardIds(config.boards)
  //   .then(boardIds => {
  //     return Promise.all(_.map(boardIds, boardId => {
  //       return createWebhook(config.auth, config.appName, config.callbackURL, boardId);
  //     }))
  //   })
  //   .then(result => {
  //     logger.info('Done creating ' + result.length + ' webhooks.');
  //   });
  // }

  // function deleteWebhooks() {
  //   return getWebhooks(config.auth, config.appName)
  //   .then(webhooks => {
  //     return Promise.all(_.map(webhooks, webhook => {
  //       return asana.delAsync('/1/webhooks/' + webhook.id);
  //     }));
  //   })
  //   .then(result => {
  //     logger.info('Done deleting ' + result.length + ' webhooks.');
  //   })
  // }

  // function handlePayload(payload) {
  //   logger.debug({method: 'handlePayload', params: {
  //     name: payload.model.name,
  //     type: payload.action.type
  //   }});
  //   return new Promise((resolve, reject) => {
  //     _.forEach(config.hooks, hook => {
  //       if (hook.trigger.actionType === payload.action.type &&
  //         hook.trigger.modelName === payload.model.name) {
  //         return hookActions[hook.action](payload, hook.config)
  //         .then(resolve);
  //       }
  //     });
  //     // resolve();
  //   });
  // }

  return {
    createWebhook,
    getHook,
    deleteHook
  }
}


function init(auth) {
  return Asana.Client.create().useAccessToken(auth.ASANA_ACCESS_TOKEN);
}