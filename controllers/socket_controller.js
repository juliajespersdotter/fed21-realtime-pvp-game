/**
 * Socket Controller
 */

const debug = require('debug')('game:socket_controller');

let io = null;


let totalGameCount = 0;
const gameList = [];


const fetchGame = id => {
    return gameList.find(gameRoom => {
        if(gameRoom.gameObject.playerOne.id === id || gameRoom.gameObject.playerTwo.id === id){
            return true;
        }
    });
}

// handle when user has disconnected from chat
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);

    if ( totalGameCount === 0 ) {
        console.log('no');
    } else {

        // find the room that this socket is part of
        let id = this.id
        const game = fetchGame(id);

        if(game){
            let room = (game.gameObject.id);
            // let everyone in the room know that user has disconnected
            this.broadcast.to(room).emit('player:disconnected', this.id);
        
            // remove user from list of connected users in that room
            delete game[this.id];
        
            // broadcast list of users in room to all connected sockets EXCEPT ourselves
            this.broadcast.to(room).emit('player:list', game.gameObject.playerOne, game.gameObject.playerTwo);
        } else{
            console.log('no game found');
        }
    }
}

const handleCreateGame = function(data, callback) {
    let gameObject = {
        playerOne: {},
        playerTwo: {}
    };
    gameObject.id = (this.id);
    gameObject.playerOne.id = this.id;
    gameObject.playerTwo.id = null;
    gameObject.playerOne.name = data.username;
    gameObject.playerTwo.name = null;
    gameObject.playerOne.avatar = data.avatar;
    gameObject.playerTwo.avatar = null;
    gameObject.playerTwo.hasClicked = false;
    gameObject.playerOne.hasClicked = false;
    totalGameCount++;
    console.log(gameObject);
    gameList.push({gameObject});

    console.log("Game Created by "+ data.username + " w/ " + gameObject.id);
    this.broadcast.to(gameObject.id).emit('player:connected', data.username, gameObject.id);
    
    callback({
        success: true,
        room: gameObject.id,
        playerOne: gameObject.playerOne,
        playerTwo: gameObject.playerTwo,
    });
};

const handleJoinGame = function(data, callback){
    console.log(data.username + " wants to join a game");

    if ( totalGameCount === 0 ) {
         callback({
            success:false
        })
    } else {
        
       const game = gameList.find(gameRoom => {
            if(gameRoom.gameObject.playerTwo.id === null){
                return true;
            }
        });

        // 
        // let rndGame = Math.floor(Math.random() * totalGameCount);
        // let gameObj = gameList[rndGame]['gameObject'];
        // if (gameObj.playerTwo['id'] === null){
        if(game){
        console.log('Open game:',game);
        game.gameObject['playerTwo']['name'] = data.username;
        game.gameObject['playerTwo']['avatar'] = data.avatar;
        game.gameObject['playerTwo']['id'] = this.id;
        const gameId = game.gameObject.playerOne.id;
        // let game = gameList[rndGame].gameObject;

        this.join(gameId);
        debug(`Player ${data.username} joined room ${gameId}`);
        this.emit('join:success', gameId);

        console.log(data.username + " has been added to: " + gameId);
        this.broadcast.to(gameId).emit('player:connected', data.username, gameId);
        let playerOne = game.gameObject.playerOne;
        let playerTwo = game.gameObject.playerTwo;

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
            console.log('NO GAME FOUND, CREATING GAME');
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
		rounds = 0;
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
        console.log("Game", game);
        this.join(game);
    })

    socket.on('player:time', handleScore);

	// handle game start logic
	socket.on('start:game', () => {
        io.emit('start:game');
    });

    socket.on('game:board', () => {
        let id = socket.id
        const game = fetchGame(id);
        let room = (game.gameObject.id);
        io.to(room).emit('game:board');
    })

    // handle when virus is clicked
    socket.on('virus:clicked', (data) => {
        // accepts data for socket to get same for both players
        // then sends back to front end
        console.log('Socket id: ' + socket.id);

        // looks for room that matches this socked it
        let id = socket.id
        const game = fetchGame(id);

        // get room id
        let room = (game.gameObject.id);
        let playerOne = game.gameObject.playerOne;
        let playerTwo = game.gameObject.playerTwo;
        console.log('Player id: ' + socket.id + ' players id', playerOne.id + ' ' + playerTwo.id);

        // check if both players clicked
        if(playerOne.id === socket.id){
            playerOne.hasClicked = true;
        } else if(playerTwo.id === socket.id){
            playerTwo.hasClicked  = true;
        }

        // if both players clicked, only then mode the virus
        if(playerOne.hasClicked && playerTwo.hasClicked){
            playerOne.hasClicked = false;
            playerTwo.hasClicked = false;
            io.to(room).emit('virus:clicked', data);
        } else{
            console.log('Waiting for player');
        }
    });

    // not functional
    socket.on('calculate:time', (data) => {
        // does not work
        let playerTime = data.showVirus - data.clickTime;
		console.log(`it took ${playerTime / 1000} seconds for you to catch the virus!`);
    })
}