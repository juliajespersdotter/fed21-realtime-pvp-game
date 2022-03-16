/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');
const models = require('../models');

<<<<<<< HEAD
let io = null;

const waiting_room = [];

const handleDisconnect = function() {
    
}

const handlePlayerJoined = function(username, channel) {
    waiting_room.push(username);

    if(waiting_room.length === 1) {
        waiting_room.forEach(player => {
            player.join(channel);
            waiting_room.pop(player);
        })

    }
}
=======
const debug = require('debug')('chat:socket_controller');

module.exports = function(socket, _io) {
	io = _io;
>>>>>>> main

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	//socket.on('disconnect', handleDisconnect);

<<<<<<< HEAD
    // handle user disconnect
    socket.on('disconnect', handleDisconnect);

    // handle user joined
    socket.on('player:joined', handlePlayerJoined);

    // handle user emitting a new message
    //socket.on('chat:message', handleChatMessage);
=======
	// handle user joined
	socket.on('user:joined', function(username) {
		this.emit('user:joined', username);
	});

	// handle user emitting a new message
	//socket.on('chat:message', handleChatMessage);
>>>>>>> main
}