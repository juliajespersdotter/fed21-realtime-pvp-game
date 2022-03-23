/**
 * * SOCKET SLAYERS
 * * socket_controller.js
 */

const debug = require('debug')('game:socket_controller');

let io = null;

//********** GAME COMPONENTS **********/
let totalGameCount = 0;
const gameList = [];



//********** CREATE GAME **********/
const handleCreateGame = function(data, callback) { // data is username and avatar from the start-form
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
    gameObject.playerOne.points = 0;
    gameObject.playerTwo.points = 0;

    totalGameCount++;
    gameList.push({gameObject});

    this.broadcast.to(gameObject.id).emit('player:connected', data.username, gameObject.id);
    io.to(this.id).emit('player:list', gameObject.playerOne, gameObject.playerTwo);
    
    callback({
        success: true,
        room: gameObject.id,
        playerOne: gameObject.playerOne,
        playerTwo: gameObject.playerTwo,
    });
};



//********** FINDS GAME **********/
const fetchGame = id => {
    return gameList.find(gameRoom => {
        if(gameRoom.gameObject.playerOne.id === id || gameRoom.gameObject.playerTwo.id === id){
            return true;
        }
    });
}



//********** JOIN GAME **********/
const handleJoinGame = function(data, callback){
    if ( totalGameCount === 0 ) {
         callback({
            success:false // creates a new game if there isnt a game to join
        });
    } else {
       const game = gameList.find(gameRoom => {
            if(gameRoom.gameObject.playerTwo.id === null){
                return true; // If there is a game where playerTwo is Null, then join this game. 
            }
        });

        if(game){ // if there is a gameObject where game has a playerTwo that is Null, then replace with this userinfo
            game.gameObject['playerTwo']['name'] = data.username;
            game.gameObject['playerTwo']['avatar'] = data.avatar;
            game.gameObject['playerTwo']['id'] = this.id;
            const gameId = game.gameObject.playerOne.id;

            this.join(gameId);
            debug(`Player ${data.username} joined room ${gameId}`);

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
        io.to(gameId).emit('player:list', playerOne, playerTwo);
        } else{
            callback({
                success:false
            })
        }
    }
}


const handleKilledVirus = function(reactionTime) {
        // accepts data for socket to get same for both players
        // then sends back to front end
        console.log('Socket id: ' + this.id);

        // looks for room that matches this socked it
        let id = this.id
        const game = fetchGame(id);

        // get room id
        let room = (game.gameObject.id);
        let playerOne = game.gameObject.playerOne;
        let playerTwo = game.gameObject.playerTwo;
        // console.log('Player id: ' + this.id + ' players id', playerOne.id + ' ' + playerTwo.id);

        // check if both players clicked
        if(playerOne.id === this.id){
            playerOne.hasClicked = true;
            playerOne['clickTime'] = reactionTime;
            // socket.emit('stop:timer1')
            // console.log("Player one click time " + data.clickTime);
            
        } else if(playerTwo.id === this.id){
            playerTwo.hasClicked  = true;
            playerTwo['clickTime'] = reactionTime;
            // playerTwo['clickTime'] = data.clickTime;
            // socket.emit('stop:timer2')
            // console.log("Player two click time " + data.clickTime);
        }

        // if both players clicked, only then mode the virus
        if(playerOne.hasClicked && playerTwo.hasClicked){
            let winner;
            playerOne.hasClicked = false;
            playerTwo.hasClicked = false;

            if(playerTwo.clickTime < playerOne.clickTime){
                playerTwo.points++;
                winner = playerTwo.name;
                // io.to(room).emit('round:over', playerTwo);
            }

            else if(playerOne.clickTime < playerTwo.clickTime){
                playerOne.points++;
                winner = playerOne.name;
            }

            io.to(room).emit('round:over', winner);
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

//********** USER DISCONNECTS **********/
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



//********** SCORE **********/
let rounds = 0;
let maxRounds = 10;
let compare;
const handleScore = function(socket) {
	//check if both players are here
	//find the room
	//the room with player1 is here?
	//the room with player2 is here?
	//if both are here then we can compare the times


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
    
    if (rounds > maxRounds) {
		io.to(room).emit('new-round');
    } else if (rounds === maxRounds) {
        io.to(room).emit('game:over');
		rounds = 0;
    }
}



//********** EXPORTS **********/
module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

    socket.on('join:game', handleJoinGame);

    socket.on('create:game', handleCreateGame);

    socket.on('player:time', handleScore);

    socket.on('virus:clicked', handleKilledVirus);

	// handle game start logic
	socket.on('start:game', () => {
        let id = socket.id;
        const game = fetchGame(id);
        let room = (game.gameObject.id);

        io.to(room).emit('new:round', {
            offsetRow: Math.ceil(Math.random() * 12 ),
			offsetColumn: Math.ceil(Math.random() * 12 ),
            randomTime:  Math.ceil(Math.random() * (5000 + 1000) + 1000)
        });
    });

    // handle when virus is clicked

    /*
    // not functional
    socket.on('calculate:time', (data) => {
        // does not work
        let playerOneTime = data.showVirus - data.playerOneTime;
        let playerTwoTime = data.showVirus - data.playerTwoTime;

        console.log("Player one time: ", playerOneTime);
        console.log("player two time: ", playerTwoTime);
		// console.log(`it took ${playerTime / 1000} seconds for you to catch the virus!`);
    })
    */
}