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

socket.on('start:game', () => {
	// does not do much at this point, check if players are ready?
	console.log("game started");
	//countdown();
	// startTimer();
})

socket.on('virus:clicked', (data) => {
	moveVirus(data.offsetRow, data.offsetColumn, data.clickTime);
	saveTime(); 
});

usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;
	console.log(`Player username is ${username}`);

	let avatar = document.querySelector('input[name="avatar"]:checked').value;

		socket.emit('join:game', {username: username, avatar: avatar} , (status) => {
		console.log(status);

		if (status.success) {
		console.log("Server acknowledged that user joined", status);
		
		startEl.classList.add('hide');

		// show game view
		gameWrapperEl.classList.remove('hide');

		updatePlayerList(status.playerOne, status.playerTwo);

	}  else if(!status.success) {
			socket.emit('create:game', {username: username, avatar: avatar}, (status) => {
	
			console.log("Server acknowledged that user joined", status);
		
				if (status.success) {
					// update list of users in room
					startEl.classList.add('hide');

					// show game view
					gameWrapperEl.classList.remove('hide');

					updatePlayerList(status.playerOne, status.playerTwo);
				}
			});
		}
	});
});


// How to make sure something only happens if both users pressed the virus?
virus.addEventListener('click', () => {
	let clickTime = new Date().getTime();
	virus.src = "./assets/img/virus-sad.svg";

	// const reactionTime = Date.now() - virusShowedAt;

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

// move the virus using randomised numbers 
function moveVirus(offsetRow, offsetColumn) {

		// let virusShowedAt = Date.now();
		// 
	
		let row = offsetRow;
		let column = offsetColumn;
		
		virus.style.gridColumn = column;
		virus.style.gridRow = row;
		virus.style.animation = "none";

		virus.src = "./assets/img/virus.svg";
		virus.classList.remove('hide');

		
		
		// showVirus = new Date().getTime();
		// socket.emit('calculate:time', {
		// 	showVirus: showVirus,
		// 	clickTime: clickTime
		// });	
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
			start = Date.now();

			startTimerPlayer1();
			startTimerPlayer2();
		} else {
			countdownHTML.innerHTML = `<h2>${countdownTime} seconds left</h2>`;
		}
		countdownTime -= 1;
	}, 1000);
	// 100
}

const startTimerPlayer1 = () => {
	var startTimestamp = moment().startOf("day");
    setInterval(function() {
        startTimestamp.add(1, 'second');
        document.getElementById('timerPlayer1').innerHTML = 
            startTimestamp.format('mm:ss');
    }, 1000);
}
    
const startTimerPlayer2 = () => {
	var startTimestamp = moment().startOf("day");
    setInterval(function() {
        startTimestamp.add(1, 'second');
        document.getElementById('timerPlayer2').innerHTML = 
            startTimestamp.format('mm:ss');
    }, 1000);
}

const saveTime  = () => {
	// här kollar vi ifall spelare 1 klickat på virus -> i så fall ska tiden sparas. När båda spelare klickat på samma virus så kallar vi på funktionen startTimer(). Om det gått 10 spelomgångar, break ut från loop. 
}
        
