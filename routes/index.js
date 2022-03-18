/**
 * Routes
 */

const express = require('express');
const router = express.Router();

//add value from when player enters a username to username. 
router.get('/', (req, res) => {
	
	console.log(players.username)
	res.render('index', { players });
});

module.exports = router;