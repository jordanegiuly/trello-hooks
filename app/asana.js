'use strict';

const _ = require('lodash');
const bluebird = require('bluebird');
const request = require('request');
bluebird.promisifyAll(request);
const logger = require('./logger.js')();
const Asana = require('asana');
let asana;

module.exports = (config) => {
  asana = asana || init(config.auth);
  const hooks = require('./hooks').asana(asana, config.hooks);

  function getHook(resourceId) {
    logger.debug({method: 'getHook', params: resourceId})
    return asana.webhooks.getAll(config.workspaceId) // TODO
    .then(res => {
      return _.find(res.data, (hook) => {
        return (hook.resource.id == resourceId);
      });
    })
  }

  function createWebhook(id) {
    logger.debug({method: 'createWebhook', params: id})
    console.log('createWebhook', config.callbackURL + id);
    return asana.webhooks.create(id, config.callbackURL + id, {}) // TODO
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

  function handlePayload(projectId, events) {
    events = events || [];
    return hooks(projectId, events);
  }

  return {
    createWebhook,
    getHook,
    deleteHook,
    handlePayload
  }
}


function init(auth) {
  return Asana.Client.create().useAccessToken(auth.ASANA_ACCESS_TOKEN);
}