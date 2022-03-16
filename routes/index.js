/**
 * Routes
 */

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
	const players = [
		{
		username: username, 
		room: room
		}
	]

	res.render('index', { players });
});

module.exports = router;