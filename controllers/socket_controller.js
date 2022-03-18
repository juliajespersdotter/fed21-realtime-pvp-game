/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');
const models = require('../models');

let io = null;

const waiting_room = [];
// hard coded room for testing
const rooms = [
    {
        id: "some room",
        name: "Some room",
        players: {},
    }
];

// handle when user has disconnected from chat
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	// find the room that this socket is part of
    const game = rooms.find(gameRoom => gameRoom.id === 'some room');

	// let everyone in the room know that user has disconnected
	this.broadcast.to('some room').emit('player:disconnected', game.players[this.id]);

	// remove user from list of connected users in that room
	delete game.players[this.id];

	// broadcast list of users in room to all connected sockets EXCEPT ourselves
	this.broadcast.to('some room').emit('player:list', game.players);
}


const handlePlayerJoined = function(username, callback) {
    // waiting room serves no purpose at this point
    waiting_room.push(username);
    this.join('some room');

    const game = rooms.find(gameRoom => gameRoom.id === 'some room');

    // sets user id to the rooms object as a player
    game.players[this.id] = username;
    this.broadcast.to('some room').emit('player:connected', username);

    // removes waiting room players
    waiting_room.forEach(player => {
        waiting_room.pop(player);
    })

    // sends object to front end with info
    callback({
        success: true,
        room: 'some room',
        players: game.players,
    });

    // broadcast list of users in room to all connected sockets EXCEPT ourselves
	this.broadcast.to('some room').emit('player:list', game.players);

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
	socket.on('disconnect', handleDisconnect);

	// handle user joined
	socket.on('player:joined', handlePlayerJoined);

	socket.on('player:time', handleScore);

	// handle user emitting a new message
	//socket.on('chat:message', handleChatMessage);
	// handle game start logic
	socket.on('start:game', () => {
        io.emit('start:game');
    });

    // handle when virus is clicked
    socket.on('virus:clicked', (data) => {
        // accepts data for socket to get same for both players
        // then sends back to front end
        io.to(socket.id).emit('virus:clicked', data);
    });

    // not functional
    socket.on('calculate:time', (data) => {
        // does not work
        let playerTime = data.showVirus - data.clickTime;
		console.log(`it took ${playerTime / 1000} seconds for you to catch the virus!`);
    })
}