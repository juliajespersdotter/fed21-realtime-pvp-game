/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');
const models = require('../models');

let io = null;

let randomNumber = 0;
const players = {};
let readyPlayers = 0;
const waiting_room = [];
const rooms = [
    {
        id: "some room",
        name: "Some room",
        players: {},
    }
];
// const rooms = ['room1', 'room2', 'room3'];

// handle when user has disconnected from chat
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	// find the room that this socket is part of
	// const room = rooms.find(chatroom => chatroom.users.hasOwnProperty(this.id));
	
	// if socket was not in a room, don't broadcast disconnect
	// if(!room) {
	// 	return;
	// }

    const game = rooms.find(gameRoom => gameRoom.id === 'some room');

	// let everyone in the room know that user has disconnected
	this.broadcast.to('some room').emit('player:disconnected', game.players[this.id]);

	// remove user from list of connected users in that room
	delete game.players[this.id];

	// broadcast list of users in room to all connected sockets EXCEPT ourselves
	this.broadcast.to('some room').emit('player:list', game.players);
}


const handlePlayerJoined = function(username, callback) {
    waiting_room.push(username);
    this.join('some room');

    const game = rooms.find(gameRoom => gameRoom.id === 'some room');

    game.players[this.id] = username;
    readyPlayers++
    this.broadcast.to('some room').emit('player:connected', username);

    waiting_room.forEach(player => {
        waiting_room.pop(player);
    })

    
    callback({
        success: true,
        room: 'some room',
        players: game.players,
    });


    // broadcast list of users in room to all connected sockets EXCEPT ourselves
	this.broadcast.to('some room').emit('player:list', game.players);

    }


const handleGameLogic = function() {
    const game = rooms.find(gameRoom => gameRoom.id === 'some room');

    //Object.keys(game.players).length === 2

    if(game){
        // get a random number between 0-99
        randomNumber = Math.floor(Math.random() * 100);
        console.log(randomNumber);
        
        this.broadcast.to('some room').emit('show:virus', randomNumber);
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

	// handle game start logic
	socket.on('randomise', handleGameLogic);
}