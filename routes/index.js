/**
 * Routes
 */

const express = require('express');
const router = express.Router();

//add value from when player enters a username to username. 
/* KOMMENTERAT BORT EFTERSOM VI INTE ANVÄNDER EJS LÄNGRE
router.get('/', (req, res) => {
	const players = [
		{
		username: "Julia"
		}
	]
	console.log(players.username)
	res.render('index', { players });
});
*/

module.exports = router;