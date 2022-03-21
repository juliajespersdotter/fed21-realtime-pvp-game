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

//recieve socketId and time --- hårdkodat sålänge
let playersTimes = [{
	"ID": "eBC8RtXvh_UZYsmRAAAX",
	"Time": 2.3423
	}, {
	"ID": "XeBC8RtXvh_UZYsmRAAAXsad",
	"Time": 3.4545
	}, {
	"ID": "askjdeBC8RtXvh_UZYsmRAAAX",
	"Time": 5.0070
}]
let rounds = 0;
//let maxRounds = 10;
const handleScore = function(socket, data) {
	rounds ++;
	console.log('rounds played', rounds);
	console.log('data', data);

	let playersClicktime = data.clickTime;
	console.log(`players time from the server ${playersClicktime} player ${socket.id}`)

	//check lowest/highest number in each object, give them 'highest' and 'lowest
	let lowest = Math.min.apply(null, playersTimes.map(function(score) {
		return score.Time;
	}));
	
	let highest = Math.max.apply(null, playersTimes.map(function(score) {
		return score.Time;
	}));
	
	console.log('The best time was', lowest);
	console.log('The worst time was', highest);

	let winnerOfThisRound = lowest;
	//send to client and compare with the time that was sent to the server.
	io.emit('scores', winnerOfThisRound, playersClicktime);
	
	/* if (rounds > maxRounds) {

	} else if (rounds === maxRounds) {
		io.emit('game:over', )
	} */
}


module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

	// handle user joined
	socket.on('player:joined', handlePlayerJoined);

	//socket.on('player:time', handleScore);

	// handle game start logic
	socket.on('start:game', () => {
        io.emit('start:game');
    });

    // handle when virus is clicked
    socket.on('virus:clicked', handleScore, (data) => {
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