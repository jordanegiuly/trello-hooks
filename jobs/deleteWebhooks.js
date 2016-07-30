'use strict';

const env = process.env.NODE_ENV || 'development';
const config = require('../app/config.js')(env);
const trello = require('../app/trello.js')(config);

trello.deleteWebhooks();
