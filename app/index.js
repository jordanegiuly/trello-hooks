'use strict';

const express = require('express');
var bodyParser = require('body-parser');
const env = process.env.NODE_ENV || 'development';
console.log('NODE ENV', env);
const config = require('./config.js')(env);
const trello = require('./trello.js')(config);
const PORT = 3000;
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	console.log('GET /');
	res.send(`HELLO WORLD Trello ${env}`);
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

app.listen(PORT, () => {
	console.log(`Listening to port ${PORT}`);
});
