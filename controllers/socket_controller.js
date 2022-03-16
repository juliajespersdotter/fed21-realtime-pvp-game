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

module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	//socket.on('disconnect', handleDisconnect);

	// handle user joined
	socket.on('player:joined', handlePlayerJoined);

	// handle user emitting a new message
	//socket.on('chat:message', handleChatMessage);
}