'use strict';

const Logger = require('le_node');
let log;

module.exports = (config) => {
	log = log || init(config);
	return log
};

function init(config) {
  console.log('init config', config)
	return new Logger({
  		token: config.auth.LOG_ENTRIES_TOKEN
	});
}
