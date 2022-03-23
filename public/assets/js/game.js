/**
 * * SOCKET SLAYERS
 * * game.js
 */


const socket = io();

//********** USERNAME AND AVATAR **********/
const usernameForm = document.querySelector('#username-form');
const chosenAvatar = document.querySelector('.avatar-wrapper');
let username = null;
let avatar = null;


//********** GAME COMPONENTS **********/
const startEl = document.querySelector('#start');
// const gameGrid = document.querySelector('.main');
const gameWrapperEl = document.querySelector('#game-wrapper');
const waitingForPlayerWrapperEl = document.querySelector('#waitingForPlayer-wrapper');
const countdownWrapperEl = document.querySelector('#countdown-wrapper');
const gameoverWrapperEl = document.querySelector('#gameover-wrapper');
const virus = document.querySelector('.virus');


//********** TIMER **********/
let intervalPlayer1;
let intervalPlayer2;



//********** USER JOINS GAME **********/
usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;

	let avatar = document.querySelector('input[name="avatar"]:checked').value;

	socket.emit('join:game', {username: username, avatar: avatar} , (status) => {

	if (status.success) {
		console.log("Server acknowledged that user joined", status);
		
		startEl.classList.add('hide');
		gameWrapperEl.classList.remove('hide');

		// updatePlayerList(status.playerOne, status.playerTwo);

		// socket.emit('start:game');

	}  else if(!status.success) {
		socket.emit('create:game', {username: username, avatar: avatar}, (status) => {
	
			console.log("Server acknowledged that user joined", status);
		
			if (status.success) {
				// socket.emit('start:game');
				startEl.classList.add('hide');
				gameWrapperEl.classList.remove('hide');

				// updatePlayerList(status.playerOne, status.playerTwo);
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
			countdownHTML.innerHTML = `<h2>Get ready to catch the virus! It can appear at any time!</h2><h2>${countdownTime} seconds left...</h2>`;
		}
		countdownTime -= 1;
	}, 1000);
}


//********** START GAME **********/
socket.on('start:game', () => {
	// does not do much at this point, check if players are ready?
	console.log("game started");
	//countdown();
})

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
			player2.innerText = `${playerTwo.name}`;
		});
		document.querySelector('.avatar2').src = playerTwo.avatar;
		// hide waitingForPlayer view
		waitingForPlayerWrapperEl.classList.add('hide');
		// show countdown
		countdownWrapperEl.classList.remove('hide');

		gameWrapperEl.classList.add('hide');
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
socket.on('player:disconnected', (username) => {
	console.log('Player disconnected', username);
});

socket.on('round:over', winner => {
	console.log('winner was: ', winner);
	socket.emit('start:game');
})

socket.on('new:round', data => {
	// does not do much at this point, check if players are ready?
	startTimerPlayer1();
	startTimerPlayer2();
	console.log("round started");

	startGame(data);
	//countdown();
})

socket.on('stop:timer1'), () => {
	stopTimerPlayer1();
};


socket.on('move:virus', (data) => {
	moveVirus(data.offsetRow, data.offsetColumn, data.clickTime);
});

/*
usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;

	let avatar = document.querySelector('input[name="avatar"]:checked').value;

	socket.emit('join:game', {username: username, avatar: avatar} , (status) => {

	if (status.success) {
		console.log("Server acknowledged that user joined", status);
		
		startEl.classList.add('hide');
		gameWrapperEl.classList.remove('hide');

		// updatePlayerList(status.playerOne, status.playerTwo);

	}  else if(!status.success) {
		socket.emit('create:game', {username: username, avatar: avatar}, (status) => {
	
			console.log("Server acknowledged that user joined", status);
		
			if (status.success) {
				startEl.classList.add('hide');
				gameWrapperEl.classList.remove('hide');

				// updatePlayerList(status.playerOne, status.playerTwo);
				}
			});
		}
	});
});
*/

const startGame = (data) => {
	// console.log("random time: " + data.randomTime);
	let timeStart = Date.now();
	moveVirus(data);

	virus.addEventListener('click', () => {
		let timeClicked = Date.now();
		let reactionTime = timeClicked - timeStart;
		virus.src = "./assets/img/virus-sad.svg";

		setTimeout(function () {
			virus.classList.add('hide');

			socket.emit('virus:clicked', reactionTime)
		}, 1000)
	})
}

/*
// How to make sure something only happens if both users pressed the virus?
virus.addEventListener('click', (timeClicked) => {
	virus.src = "./assets/img/virus-sad.svg";

	// let clickTime = Date.now();
	// console.log(clickTime);

	setTimeout(function () {
		virus.classList.add('hide');

	// when virus is clicked, randomise new numbers and send to socket
		socket.emit('virus:clicked', {
			offsetRow: Math.ceil(Math.random() * 12 ),
			offsetColumn: Math.ceil(Math.random() * 12 ),
		});
	}, 1000)


	// when virus is clicked, randomise new numbers and send to socket
});
*/

// move the virus using randomised numbers 
function moveVirus(data) {
		resetTimer();
		startTimerPlayer1();
		startTimerPlayer2();

		let row = data.offsetRow;
		let column = data.offsetColumn;
		
		virus.style.gridColumn = column;
		virus.style.gridRow = row;
		virus.style.animation = "none";

		virus.src = "./assets/img/virus.svg";
		virus.classList.remove('hide');
}



//********** SCORE **********/
let score = 0;
socket.on('scores', (data) => { //data innehåller winnerOfThisRound, vilket är den lägsta tiden
	let myTime = time;
	if (myTime === data) {
		const addScore = document.getElementById("player1-score"); // #player1-score?
		addScore.innerHTML = `<h2>${score++}</h2>`;
	} else if (myTime === data){
		return;
	}
});

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
socket.on('game:over', (winnerOfTheGame, room) => {
	let gameoverHTML = document.getElementById("gameoverId");
	gameoverWrapperEl.classList.remove('hide');

	setInterval(function() {
		if(countdownTime <= 0) {
			gameoverWrapperEl.classList.add('hide');
			startEl.classList.remove('hide');
		} else {
			if (winnerOfTheGame === socket.id) {
				gameoverHTML.innerHTML = `<h2>You're the winner!</h2>`
			} else {
				gameoverHTML.innerHTML = `<h2>You lost :( Better luck next time!</h2>`
			}
		}
	}, 5000);
});
        
