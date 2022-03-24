/**
 * * SOCKET SLAYERS
 * * socket_controller.js
 */

const debug = require('debug')('game:socket_controller');

let io = null;

//********** GAME COMPONENTS **********/
let totalGameCount = 0;
const gameList = [];


// Get random number for virus delay
const getRandomNumber = (max, min) => {
    return Math.floor(Math.random() * (max - min)) + min;
  };

//********** FINDS GAME **********/
const fetchGame = id => {
    return gameList.find(gameRoom => {
        if(gameRoom.gameObject.playerOne.id === id || gameRoom.gameObject.playerTwo.id === id){
            return true;
        }
    });
}


//********** CREATE GAME **********/
const handleCreateGame = function(data, callback) { // data is username and avatar from the start-form
    let gameObject = {
        id: this.id,
        rounds: 0,
        playerOne: {
            id: this.id,
            name: data.username,
            avatar: data.avatar,
            hasClicked: false,
            points: 0
        },
        playerTwo: {
            id: null,
            name: null,
            avatar: null,
            hasClicked: false,
            points: 0
        }
    };

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



//********** JOIN GAME **********/
const handleJoinGame = function(data, callback){
    if ( totalGameCount === 0 ) {
         callback({
            success:false // creates a new game if there isnt a game to join
        });
    } else {
       const game = gameList.find(gameRoom => {
            if(gameRoom.gameObject.id){
                return true; // If there is a game where id is not Null, then join this game. 
            }
        });

        // if there is a gameObject where game has a playerTwo that is Null, then replace with this userinfo
        if(game.gameObject.playerTwo.id === null){
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
            io.to(gameId).emit('player:list', playerOne, playerTwo);
            callback({
                success: true,
                room: gameId,
                playerOne: playerOne,
                playerTwo: playerTwo
            });
        } else if(!game){
            callback({
                success:false
            })
        }
    }
}

const startGame = function(delay) {  
    let id = this.id;
    let game = fetchGame(id);
    let room = (game.gameObject.id);
    game.gameObject.playerOne.hasClicked = false;
    game.gameObject.playerTwo.hasClicked = false;

    io.to(room).emit('new:round', {
        offsetRow: Math.ceil(Math.random() * 12 ),
        offsetColumn: Math.ceil(Math.random() * 12 ),
        delay: delay
    });
}

const handleKilledVirus = function(reactionTime) {
    // accepts data for socket to get same for both players
    // then sends back to front end

    // looks for room that matches this socked it
    let id = this.id;
    let game = fetchGame(id);
    
    // get room id
    let room = (game.gameObject.id);
    let playerOne = game.gameObject.playerOne;
    let playerTwo = game.gameObject.playerTwo;
    let winner = null;

    
    // check if both players clicked
    if(playerOne.id === this.id){
        playerOne.hasClicked = true;
        playerOne['clickTime'] = reactionTime;
        io.to(room).emit('stop:timer', playerOne, playerTwo);
        
    } else if(playerTwo.id === this.id){
        playerTwo.hasClicked  = true;
        playerTwo['clickTime'] = reactionTime;
        io.to(room).emit('stop:timer', playerOne, playerTwo);
    }

    // if both players clicked, only then move the virus
    if(playerOne.hasClicked && playerTwo.hasClicked){
        playerOne.hasClicked = false;
        playerTwo.hasClicked = false;
        game.gameObject.rounds++;

        let delay = getRandomNumber(5000, 1000);

        // if player two is the winner
        if(playerTwo.clickTime < playerOne.clickTime){
            playerTwo.points++;

            // if the points added up is 10
            if(playerTwo.points + playerOne.points === 10) {
                game.gameObject.rounds = 0;
    
                if(playerOne.points > playerTwo.points){
                    io.to(room).emit('game:over', playerOne, playerTwo);
                }
                else if(playerTwo.points > playerOne.points){
                    io.to(room).emit('game:over', playerTwo, playerOne);
                }
                else {
                    io.to(room).emit('no:winner', playerTwo, playerOne);
                }
            }

            winner = playerTwo;

            io.to(room).emit('round:over', {
                playerOne: playerOne,
                playerTwo: playerTwo,
                winner: winner,
                delay: delay
            });
        }    

        // if player one is the winner
        else if(playerOne.clickTime < playerTwo.clickTime){
            playerOne.points++;

            // if the points added up is 10
            if(playerTwo.points + playerOne.points === 10){
                game.gameObject.rounds = 0;
    
                if(playerOne.points > playerTwo.points){
                    io.to(room).emit('game:over', playerOne, playerTwo);
                }
                else if(playerTwo.points > playerOne.points){
                    io.to(room).emit('game:over', playerTwo, playerOne);
                }
                else {
                    io.to(room).emit('no:winner', playerTwo, playerOne);
                }

            } else{
                winner = playerOne;
    
                io.to(room).emit('round:over',{
                    playerOne: playerOne,
                    playerTwo: playerTwo,
                    winner: winner,
                    delay: delay
                });
            }
        }
    }
}

//********** USER DISCONNECTS **********/
const handleDisconnect = function() {
	debug(`Client ${this.id} disconnected :(`);
    if ( totalGameCount === 0 ) {
        console.log('no');
    } else{
    let id = this.id;
    let game = fetchGame(id);
    let room = (game.gameObject.id);
    

    if(game && room){
        
        // let everyone in the game know that user has disconnected
        this.broadcast.to(room).emit('player:disconnected', id);
        io.to(room).emit('reset');
        
        // remove game object
        game.gameObject.playerOne = '';
        game.gameObject.id = null;
        game.gameObject.playerTwo = '';
        game.gameObject.id = null;

        totalGameCount -= 1;
        console.log('totalgamecount: ', totalGameCount)
    
        console.log('All rooms after delete:' , gameList);

    } else{
        io.to(room).emit('reset');
    }
    }
}


//********** EXPORTS **********/
module.exports = function(socket, _io) {
	io = _io;

	debug('a new player has connected', socket.id);

	io.emit("new-connection", "A new player connected");

	// handle user disconnect
	socket.on('disconnect', handleDisconnect);

    // handle join game
    socket.on('join:game', handleJoinGame);

    // handle create game
    socket.on('create:game', handleCreateGame);

    // handle virus clicked
    socket.on('virus:clicked', handleKilledVirus);

	// handle game start logic
	socket.on('start:game', startGame);

    socket.on('reset:game', handleDisconnect)
}