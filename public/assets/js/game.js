/**
 * Game
 */


const socket = io();
const startEl = document.querySelector('#start');
const gameGrid = document.querySelector('.main');
const gameWrapperEl = document.querySelector('#game-wrapper');
const waitingForPlayerWrapperEl = document.querySelector('#waitingForPlayer-wrapper');
const countdownWrapperEl = document.querySelector('#countdown-wrapper');
const usernameForm = document.querySelector('#username-form');
const chosenAvatar = document.querySelector('.avatar-wrapper');
const virus = document.querySelector('.virus');

let username = null;
let avatar = null;
let timeStart = Date.now();

//* TIMER
let intervalPlayer1;
let intervalPlayer2;

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

socket.on('player:connected', (username, room) => {
	console.log(`New player connected in room ${room} with username ${username}`);
});

socket.on('player:disconnected', (username) => {
	console.log('Player disconnected', username);
});

socket.on('round:over', winner => {
	console.log('winner was: ', winner.name);
	socket.emit('start:game');
})

socket.on('new:round', data => {
	// does not do much at this point, check if players are ready?
	startTimerPlayer1();
	startTimerPlayer2();
	console.log("round started");
	timeStart = Date.now();
	console.log("Time start " + timeStart);

	startGame(data, timeStart);
	//countdown();
})

socket.on('stop:timer1'), () => {
	stopTimerPlayer1();
};

socket.on('stop:timer2'), () => {
	stopTimerPlayer2();
};

socket.on('virus:clicked', (data) => {
	moveVirus(data.offsetRow, data.offsetColumn, data.clickTime);
});

usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;

	let avatar = document.querySelector('input[name="avatar"]:checked').value;

	socket.emit('join:game', {username: username, avatar: avatar} , (status) => {

	if (status.success) {
		console.log("Server acknowledged that user joined", status);
		
		startEl.classList.add('hide');
		gameWrapperEl.classList.remove('hide');

		updatePlayerList(status.playerOne, status.playerTwo);

		socket.emit('start:game');

	}  else if(!status.success) {
		socket.emit('create:game', {username: username, avatar: avatar}, (status) => {
	
			console.log("Server acknowledged that user joined", status);
		
			if (status.success) {
				socket.emit('start:game');
				startEl.classList.add('hide');
				gameWrapperEl.classList.remove('hide');

				updatePlayerList(status.playerOne, status.playerTwo);
				}
			});
		}
	});
});

const startGame = (data, time) => {
	setTimeout(function(){
		moveVirus(data);
	}, data.randomTimeout)

	virus.addEventListener('click', () => {
		let timeClicked = Date.now();
		let reactiontime = timeClicked - time;
		virus.src = "./assets/img/virus-sad.svg";

		setTimeout(function () {
			virus.classList.add('hide');

			socket.emit('virus:clicked', reactiontime)
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

let countdownTime = 3;
const countdown = () => {
	let countdownHTML = document.getElementById("countdownId");

	let timer = setInterval(function() {
		if(countdownTime <= 0) {
			clearInterval(timer);
			gameWrapperEl.classList.remove('hide');
			countdownWrapperEl.classList.add('hide');

			startTimerPlayer1();
			startTimerPlayer2();
		} else {
			countdownHTML.innerHTML = `<h2>${countdownTime} seconds left</h2>`;
		}
		countdownTime -= 1;
	}, 1000);
}

//* TIMER FUNCTIONS
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


        
