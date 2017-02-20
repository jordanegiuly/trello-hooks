'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'development';
const config = require('../config')(env);
const logger = require('./logger.js')(config);
const asana = require('./asana.js')(config.asana);
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	logger.info({
		method: 'GET',
		route: '/'
	})
	res.send(`Spendesk hooks up and running (env: ${env})!`);
});

app.get('/trellohooks', (req, res) => {
	console.log('GET /trellohooks');
	res.send('OK');
});

app.post('/trellohooks', (req, res) => {
	console.log('POST /trellohooks');
	trello.handlePayload(req.body)
	.then(() => {
		res.send('OK');
	});
});

app.get('/asana/gethook/:id', (req, res) => {
	logger.info({
		method: 'GET',
		route: '/asana/gethook/' + req.params.id
	});
	asana.getHook(req.params.id)
	.then(hook => {
		return hook || asana.createWebhook(req.params.id);
	})
	.then(hook => {
		res.json(hook);
	})
	.catch(err => {
		res.send(err);
	});
});

app.get('/asana/deletehook/:id', (req, res) => {
	logger.info({
		method: 'GET',
		route: '/asana/gethook/' + req.params.id
	});
	console.log('GET /asana/deletehook/' + req.params.id);
	asana.deleteHook(req.params.id)
	.then(result => {
		res.send(result);
	})
	.catch(err => {
		res.send(err);
	});
})

app.post('/asana/hook/:id', (req, res) => {
	logger.info({
		method: 'POST',
		route: '/asana/hook/' + req.params.id
	});
	console.log('POST /asana/hook/' + req.params.id);
	asana.handlePayload(req.params.id, req.body.events)
	.then(() => {
		res.header('x-hook-secret', req.headers['x-hook-secret'])
		res.send('OK');
	})
	.catch(err => {
		console.log(err);
	})
});

app.listen(PORT, () => {
	console.log(`Listening to port ${PORT}`);
});
