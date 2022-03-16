/**
 * Socket Controller
 */


const debug = require('debug')('chat:socket_controller');

module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	//socket.on('disconnect', handleDisconnect);

	// handle user joined
	socket.on('user:joined', function(username) {
		this.emit('user:joined', username);
	});

	// handle user emitting a new message
	//socket.on('chat:message', handleChatMessage);
}