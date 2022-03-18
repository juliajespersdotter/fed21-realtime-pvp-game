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


module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

	// handle user joined
	socket.on('player:joined', handlePlayerJoined);

	// handle game start logic
	socket.on('start:game', () => {
        io.emit('start:game');
    });

    // handle when virus is clicked
    socket.on('virus:clicked', (data) => {
        // accepts data for socket to get same for both players
        // then sends back to front end
        io.emit('virus:clicked', data);
    });

    // not functional
    socket.on('calculate:time', (data) => {
        // does not work
        let playerTime = data.showVirus - data.clickTime;
		console.log(`it took ${playerTime / 1000} seconds for you to catch the virus!`);
    })
}