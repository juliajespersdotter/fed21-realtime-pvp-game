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
let rounds = 0;
let maxRounds = 10;
let compare;
const handleScore = function(playersTime, player) {
	rounds ++;
	console.log('rounds played', rounds);

	let usersInTheRoom = [];
	//if (usersInTheRoom )
	//compare time between playerA and B
	/* let compare = {
		playersTime,
		player,
		room,
	} */

	usersInTheRoom = [{
		room: []
	}]
	console.log(`players time from the server ${playersTime} player ${player}`)


	//plocka ut playersTime, jämför playersTime med playersTime. Behåll den med lägst playersTime. Hitta var den playersTime finns och vilken player som tillhör.

	//player with lowest time is the winner
/* 	let winner = if (playersTime)

	//find the room that this socket is part of
	const usersRoom = rooms.find(room => {
		if (room.users.hasOwnProperty(this.id)) {
			return true;
		}
	}); */

	//tell the score to everyone in the room
	//this.broadcast.to(usersRoom.id).emit('winner', usersRoom.users);
	//front: when they recieve the winner 1 point should be added to score.
	
	if (rounds > maxRounds) {

	} else if (rounds === maxRounds) {
		io.emit('game:over', )
	}
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