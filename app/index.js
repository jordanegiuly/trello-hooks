'use strict';

const express = require('express');
const PORT = 3000;
const app = express();

app.get('/', (req, res) => {
	console.log('GET /');
	res.send('HELLO WORLD 2!');
});

app.listen(PORT, () => {
	console.log(`Listening to port ${PORT}`);
});
