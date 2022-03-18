/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');
const models = require('../models');

let io = null;

const waiting_room = [];
const rooms = ['room1', 'room2', 'room3'];


const handlePlayerJoined = function(username, callback) {
    waiting_room.push(username);

    if(waiting_room.length === 2) {
        waiting_room.forEach(player => {
            waiting_room.pop(player);
        })

        this.broadcast.to('some room').emit('player:connected', username);

        callback({
            success: true,
            room: 'some room',
            player: username
        });

    }
}
/* 
const handleGame = function(room, player, callback) {
	//the game has been played 10 times and the players have finished the game.
	const randdomTimeForVirusToShow = Math.floor(Math.random() * 10000) + 1;
	
	const gameInfo = {
		randdomTimeForVirusToShow,
	};
} */

let compare;
const handleScore = function(playersTime, player, room) {

	//compare time between playerA and B
	/* let compare = {
		playersTime,
		player,
		room,
	} */

	let scores = [];

	function getHighestTime(arr){
		let highest = 0;

		for (let i = 0; i < arr.length; i++) {
			if (highest < arr[i] ) {
				highest = arr[i];
			}
		}
		return highest;
	}

	socket.on('connection', function(client) {
		client.on('join', function(data) {
			client.join("scores"); // Join socket IO Room
		});
	
		client.on('playerScore', function(data){ 
			scores.push(data);
			//Send to all users in scores room
			socket.in("scores").emit('scores', getHighest(scores)); 
		});
	});

	//plocka ut playersTime, jämför playersTime med playersTime. Behåll den med lägst playersTime. Hitta var den playersTime finns och vilken player som tillhör.

	//player with lowest time is the winner
	if (theTwoScores.playersTime) {

	}

	//find the room that this socket is part of
	const room = rooms.find(chatroom => {
		if (chatroom.users.hasOwnProperty(this.id)) {
			return true;
		}
	});

	//tell the score to everyone in the room
	this.broadcast.to(room.id).emit('winner', room.users);
	//front: when they recieve the winner 1 point should be added to score.
}

module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	//socket.on('disconnect', handleDisconnect);

	// handle user joined
	socket.on('player:joined', handlePlayerJoined);

	socket.on('player:time', handleScore);

	// handle user emitting a new message
	//socket.on('chat:message', handleChatMessage);
}