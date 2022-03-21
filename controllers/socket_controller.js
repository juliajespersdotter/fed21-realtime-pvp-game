/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');
const models = require('../models');

let io = null;


let totalGameCount = 0;
const gameList = [];


// handle when user has disconnected from chat
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

	// find the room that this socket is part of
    const game = gameList.find(gameRoom => gameRoom.id === this.id);

	// let everyone in the room know that user has disconnected
	this.broadcast.to(game).emit('player:disconnected', this.id);

	// remove user from list of connected users in that room
	// delete game[this.id];

	// broadcast list of users in room to all connected sockets EXCEPT ourselves
	// this.broadcast.to('some room').emit('player:list', game.players);
}

const handleCreateGame = function(data, callback) {
    let gameObject = {};
    let playerOne = {};
    let playerTwo = {};
    gameObject.id = (this.id);
    playerOne.name = data.username;
    playerTwo.name = null;
    playerOne.avatar = data.avatar;
    playerTwo.avatar = null;
    totalGameCount++;
    gameObject = {playerOne, playerTwo};
    gameList.push({gameObject});

    console.log("Game Created by "+ data.username + " w/ " + gameObject.id);
    this.broadcast.to(gameObject.id).emit('player:connected', data.username, gameObject.id);
    this.emit('join', this.id);
    

    callback({
        success: true,
        room: gameObject.id,
        playerOne: playerOne,
        playerTwo: playerTwo
    });
};

const handleJoinGame = function(data, callback){
    console.log(data.username + " wants to join a game");

    if ( totalGameCount === 0 ) {
         callback({
            success:false
        })
    } else {
        let rndGame = Math.floor(Math.random() * totalGameCount);
        if (gameList[rndGame].gameObject.playerTwo.name === null){
            gameList[rndGame].gameObject.playerTwo.name = data.username;
            gameList[rndGame]['gameObject']['playerTwo'].avatar = data.avatar;
            const gameId = gameList[rndGame].gameObject.id;
            console.log(gameId);
            let game = gameList[rndGame].gameObject;

            this.emit('join', gameId);
            this.emit('join:success', game);
            //this.join(gameId);

            console.log(data.username + " has been added to: " + gameId);
            this.broadcast.to(gameId).emit('player:connected', data.username, gameId);
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

let playersTimes = [{
    ID: "eBC8RtXvh_UZYsmRAAAX",
    Time: 2.3423
    }, {
    ID: "XeBC8RtXvh_UZYsmRAAAXsad",
    Time: 3.4545
    }, {
    ID: "askjdeBC8RtXvh_UZYsmRAAAX",
    Time: 5.0070
}]
let rounds = 0;
let maxRounds = 10;
let compare;
const handleScore = function(socket) {
    rounds ++;
    console.log('rounds played', rounds);

    console.log(`players time from the server ${playersTime} player ${player}`)

    //check that array has 0-1 index.
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
    socket.emit('scores', winnerOfThisRound);

/*  socket.on('connection', function(client) {
        client.on('join', function(data) {
            client.join("playersScore"); // Join socket IO Room
        });
    
        client.on('playerScore', function(data){ 
            scores.push(data);
            //Send to all users in scores room
            socket.in("scores").emit('scores', getHighest(scores)); 
        });
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

    socket.on('join:game', handleJoinGame);

    socket.on('create:game', handleCreateGame);

    socket.on('join', game => {
        this.join(game);
    })

    socket.on('player:time', handleScore);

	// handle game start logic
	socket.on('start:game', () => {
        io.emit('start:game');
    });

    // handle when virus is clicked
    socket.on('virus:clicked', (data) => {
        // accepts data for socket to get same for both players
        // then sends back to front end
        socket.emit('virus:clicked', data);
    });

    // not functional
    socket.on('calculate:time', (data) => {
        // does not work
        let playerTime = data.showVirus - data.clickTime;
		console.log(`it took ${playerTime / 1000} seconds for you to catch the virus!`);
    })
}