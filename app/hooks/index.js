'use strict';

module.exports = {
  asana: (params, config) => {
    return require('./asana.js')(params, config);
  },

  trello: (params) => {
    return require('./trello.js')(params);
  }
}
