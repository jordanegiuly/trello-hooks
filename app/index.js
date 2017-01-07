'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'development';
const config = require('../config')(env);
const logger = require('./logger.js')(config);
// const trello = require('./trello.js')(config.trello);
const asana = require('./asana.js')(config.asana);
const PORT = process.env.PORT || 3000;
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	console.log('GET /');
	res.send(`HELLO WORLD YO ${env}`);
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
	console.log('GET /asana/gethook/235804693150728' + req.params.id);
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
	console.log('POST /asana/hook/' + req.params.id);
	// asana.handlePayload(req.body)
	// .then(() => {
	// 	res.send('OK');
	// });
	res.header('x-hook-secret', req.headers['x-hook-secret'])
	res.send('OK');
});

app.listen(PORT, () => {
	console.log(`Listening to port ${PORT}`);
});
