/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');
const models = require('../models');

let io = null;
let clicks = 0;

let gameCollection = {
    totalGameCount: 0,
    gameList: []
};

// handle when user has disconnected from chat
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	// find the room that this socket is part of
    const game = gameCollection.gameList.find(gameRoom => gameRoom.id === this.id);

	// let everyone in the room know that user has disconnected
	this.broadcast.to(game).emit('player:disconnected', this.id);

	// remove user from list of connected users in that room
	// delete game[this.id];

	// broadcast list of users in room to all connected sockets EXCEPT ourselves
	// this.broadcast.to('some room').emit('player:list', game.players);
}

const handleCreateGame = function(username, callback) {
    let gameObject = {};
    gameObject.id = (this.id);
    gameObject.playerOne = username;
    gameObject.playerTwo = null;
    gameCollection.totalGameCount++;
    gameCollection.gameList.push({gameObject});

    console.log("Game Created by "+ username + " w/ " + gameObject.id);
    this.broadcast.to(gameObject.id).emit('player:connected', username);
    this.emit('join', this.id);
    

    callback({
        success: true,
        room: gameObject.id,
        playerOne: gameObject.playerOne,
        playerTwo: null
    });



};

const handleJoinGame = function(username, callback){
    console.log(username + " wants to join a game");

    if ( gameCollection.totalGameCount === 0 ) {
         callback({
            success:false
        })
    } else {
        var rndPick = Math.floor(Math.random() * gameCollection.totalGameCount);
        if (gameCollection.gameList[rndPick]['gameObject']['playerTwo'] === null){
            gameCollection.gameList[rndPick]['gameObject']['playerTwo'] = username;
            const gameId = gameCollection.gameList[rndPick].gameObject.id;
            console.log(gameId);
            let game = gameCollection.gameList[rndPick].gameObject;

            this.emit('join', gameId);
            this.emit('join:success', game);
            //this.join(gameId);

            console.log( username + " has been added to: " + gameId);
            let playerOne = game.playerOne;
            let playerTwo = game.playerTwo;
    
            // sends object to front end with info
            callback({
                success: true,
                room: gameId,
                playerOne: playerOne,
                playerTwo: playerTwo
            });
        
            // broadcast list of users in room to all connected sockets EXCEPT ourselves
            this.broadcast.to(gameId).emit('player:list', playerOne, playerTwo);
        } else{
            callback({
                success:false
            })
        }
    }
}

module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

	// handle user joined
	// socket.on('player:joined', handlePlayerJoined);

    socket.on('join:game', handleJoinGame);

    socket.on('create:game', handleCreateGame);

    socket.on('join', game => {
        this.join(game);
    })

	// handle game start logic
	socket.on('start:game', () => {
        io.emit('start:game');
    });

    // handle when virus is clicked
    socket.on('virus:clicked', (data) => {
        // accepts data for socket to get same for both players
        // then sends back to front end
        clicks ++;
        console.log(clicks);
        console.log("Waiting for player to click...");
        if(clicks === 2){
            io.emit('virus:clicked', data);
            clicks = 0;
        }
    });

    // not functional
    socket.on('calculate:time', (data) => {
        // does not work
        let playerTime = data.showVirus - data.clickTime;
		console.log(`it took ${playerTime / 1000} seconds for you to catch the virus!`);
    })
}