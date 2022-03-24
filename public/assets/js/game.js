/**
 * * SOCKET SLAYERS
 * * game.js
 */


const socket = io();

//********** USERNAME AND AVATAR **********/
const usernameForm = document.querySelector('#username-form');
const chosenAvatar = document.querySelector('.avatar-wrapper');
let username = null;


//********** GAME COMPONENTS **********/
const startEl = document.querySelector('#start');
const gameWrapperEl = document.querySelector('#game-wrapper');
const waitingForPlayerWrapperEl = document.querySelector('#waitingForPlayer-wrapper');
const countdownWrapperEl = document.querySelector('#countdown-wrapper');
const gameoverWrapperEl = document.querySelector('#gameover-wrapper');
const virus = document.querySelector('.virus');
const playerOneScore = document.querySelector('#player1-score');
const playerTwoScore = document.querySelector('#player2-score');


//********** TIMER **********/
let intervalPlayer1;
let intervalPlayer2;

socket.on('reset', () => {
	reset();
})

const reset = () => {
	gameWrapperEl.classList.add('hide');
	playerOneScore.innerHTML = "0";
	playerTwoScore.innerHTML = "0";
	gameWrapperEl.classList.add('hide');
	startEl.classList.remove('hide');
	document.querySelectorAll('.player1').forEach(player1 => {
		player1.innerText = "";
	});
	document.querySelectorAll('.player2').forEach(player2 => {
		player2.innerText = "";
	});
}


//********** USER JOINS GAME **********/
usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;

	let avatar = document.querySelector('input[name="avatar"]:checked').value;

	socket.emit('join:game', {username: username, avatar: avatar} , (status) => {

	if (status.success) {
		console.log("Server acknowledged that user joined", status);
		
		startEl.classList.add('hide');

	}  else if(!status.success) {
		socket.emit('create:game', {username: username, avatar: avatar}, (status) => {
	
			console.log("Server acknowledged that user joined", status);
		
			if (status.success) {
				// socket.emit('start:game');
				startEl.classList.add('hide');

				}
			});
		}
	});
});

//********** COUNTDOWN FOR GAME TO START **********/
let countdownTime = 3;
const countdown = () => {
	let countdownHTML = document.getElementById("countdownId");

	let timer = setInterval(function() {
		if(countdownTime <= 0) {
			clearInterval(timer);
			gameWrapperEl.classList.remove('hide');
			countdownWrapperEl.classList.add('hide');
		} else {
			countdownHTML.innerHTML = `<h2>Get ready to catch the virus! It can appear at any time!</h2>
			<h2>${countdownTime} seconds left...</h2>`;
		}
		countdownTime -= 1;
	}, 1000);
}


//********** START GAME **********/

socket.on('player:connected', (username, room) => {
	console.log(`New player connected in room ${room} with username ${username}`);
});


//********** UPDATE PLAYERLIST **********/
const updatePlayerList = (playerOne, playerTwo) => {
	let playerOne_list = document.querySelectorAll('.player1'); 
	playerOne_list.forEach(player1 => {
		player1.innerText = `${playerOne.name}`;
	});
	document.querySelector('.avatar1').src = playerOne.avatar;

	if(playerTwo.name === null){
		// hide game view
		gameWrapperEl.classList.add('hide');
		// show waitingForPlayer view
		waitingForPlayerWrapperEl.classList.remove('hide');

	} else {
		let playerTwo_list = document.querySelectorAll('.player2');
		playerTwo_list.forEach(player2 => {
			gameWrapperEl.classList.add('hide');
			player2.innerText = `${playerTwo.name}`;
		});
		document.querySelector('.avatar2').src = playerTwo.avatar;
		// hide waitingForPlayer view
		waitingForPlayerWrapperEl.classList.add('hide');
		// show countdown
		countdownWrapperEl.classList.remove('hide');

		//start countdown
		countdown();	

		setTimeout(function(){
			socket.emit('start:game');
		}, 4000)
	}	
}

socket.on('player:list', (playerOne, playerTwo) => {
	updatePlayerList(playerOne, playerTwo);
})

//********** USER DISCONNECTS **********/
socket.on('player:disconnected', (id) => {
	console.log('Player disconnected with id', id);
});

socket.on('round:over', data => {
	console.log('winner was: ', data.winner.name);
	if(data.winner.id == data.playerOne.id){
		playerOneScore.innerText = `${data.winner.points}`;
	}
	else{
		playerTwoScore.innerText = `${data.winner.points}`;
	}
	socket.emit('start:game', data.delay);
})

socket.on('new:round', data => {
	// start new round
	console.log("round started");
	startGame(data);
})

const startGame = (data) => {
	// console.log("random time: " + data.randomTime);
	setTimeout(function (){
		moveVirus(data);
	
		let timeStart = Date.now();

		virus.addEventListener('click', () => {
			let timeClicked = Date.now();
			let reactionTime = timeClicked - timeStart;
			virus.src = "./assets/img/virus-sad.svg";

			setTimeout(function(){
				virus.classList.add('hide');
			}, 1000)
		
			socket.emit('virus:clicked', reactionTime)
		})
	}, data.delay)
}

// move the virus using randomised numbers 
function moveVirus(data) {
		startTimerPlayer1();
		startTimerPlayer2();

		let row = data.offsetRow;
		let column = data.offsetColumn;
		
		virus.style.gridColumn = column;
		virus.style.gridRow = row;
		virus.style.animation = "none";

		virus.src = "./assets/img/virus.svg";
	
		setTimeout(function(){
			resetTimer();
			virus.classList.remove('hide');
		}, 1000)
}

//********** TIMER **********/

socket.on('stop:timer1'), () => {
	stopTimerPlayer1();
};

socket.on('stop:timer2'), () => {
	stopTimerPlayer2();
};


const startTimerPlayer1 = () => {
	stopTimerPlayer1();
	let startTimestamp = Date.now();
    intervalPlayer1 = setInterval(function() {
        let elapsedTime = Date.now() - startTimestamp;
        document.getElementById('timerPlayer1').innerHTML = 
            (elapsedTime / 1000).toFixed(2);
    }, 10);
}
    
const startTimerPlayer2 = () => {
	stopTimerPlayer2();
	let startTimestamp = Date.now();
    intervalPlayer2 = setInterval(function() {
        let elapsedTime = Date.now() - startTimestamp;
        document.getElementById('timerPlayer2').innerHTML = 
            (elapsedTime / 1000).toFixed(2);
    }, 10);
}

 //i några sekunder - sen skickas tillbaka till start page (för username)
function stopTimerPlayer1() {
	clearInterval(intervalPlayer1);
}
  
function stopTimerPlayer2() {
	  clearInterval(intervalPlayer2);
}

function resetTimer() {
	seconds = 0;
	milliseconds = 0;
	timerPlayer1.innerHTML = `00 : 00`;
	timerPlayer2.innerHTML = `00 : 00`;
}


//********** GAME OVER **********/
socket.on('game:over', (winnerOfTheGame, loser) => {
	let gameoverHTML = document.getElementById("gameoverId");
	gameoverWrapperEl.classList.remove('hide');
	startEl.classList.add('hide');
	gameWrapperEl.classList.add('hide');

	if (winnerOfTheGame.id === socket.id) {
		gameoverHTML.innerHTML = `<h2>You're the winner! You got ${winnerOfTheGame.points} points!</h2>`
	} else {
		gameoverHTML.innerHTML = `<h2>You lost :( You got ${loser.points} points. Better luck next time!</h2>`
	}

	setTimeout(function() {
		reset();
	}, 5000);
});

socket.on('no:winner', (playerOne, playerTwo) => {
	let gameoverHTML = document.getElementById("gameoverId");
	gameoverWrapperEl.classList.remove('hide');
	startEl.classList.add('hide');
	gameWrapperEl.classList.add('hide');

	gameoverHTML.innerHTML = `<h2>You both got equal points! Player One: ${playerOne.points} Player Two: ${playerTwo.points}</h2>`

	setTimeout(function() {
		reset();
	}, 5000);
})
        
