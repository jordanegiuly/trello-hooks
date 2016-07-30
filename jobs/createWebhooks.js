'use strict';

const config = require('../app/config.js');
const trello = require('../app/trello.js')(config);

trello.createWebhooks();
