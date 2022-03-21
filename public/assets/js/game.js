/**
 * Game
 */

const socket = io();
const startEl = document.querySelector('#start');
const gameGrid = document.querySelector('.main');
const gameWrapperEl = document.querySelector('#game-wrapper');
const usernameForm = document.querySelector('#username-form');
const chosenAvatar = document.querySelector('.avatar-wrapper');
const virus = document.querySelector('.virus');

let username = null;
let avatar = null;

/*
Efter att användare fyllt i användarnamn och valt avatar kontrolleras ifall det finns en spelare som är redo att spela.
typ....
if (userReady) {
	prompt('Are you ready?');
} else {
	sätt diven som håller waitingroom till 'show' 
} och igen när det kommer in en spelare som vill spela så måste prompten komma upp....
*/

// update user list with avatar (avatar not included as parameter now)
const updatePlayerList = (playerOne, playerTwo) => {
	document.querySelector('#player1').innerText = `${playerOne.name}`;
	document.querySelector('#avatar1').src = playerOne.avatar;

	if(playerTwo.name === null){
		document.querySelector('#player2').innerText = `Waiting for player..`;

	} else{
		document.querySelector('#player2').innerText = `${playerTwo.name}`;
		document.querySelector('#avatar2').src = playerTwo.avatar;
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
	startTimer();
})

socket.on('already:joined', data => {
	console.log("You are already in an existing game " + data.id);
})

socket.on('join:success', data => {
	console.log("You joined the game " + data.id);
})

socket.on('virus:clicked', (data) => {
	moveVirus(data.offsetRow, data.offsetColumn, data.clickTime);
});

usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;
	console.log(`Player username is ${username}`);

	let avatar = document.querySelector('input[name="avatar"]:checked').value;
	console.log(avatar);

	if(username || avatar) {
		socket.emit('join:game', {username: username, avatar: avatar} , (status) => {
			
			console.log("Server acknowledged that user joined", status);
	
			if (status.success) {
				socket.emit('start:game');
				// hide form view
				startEl.classList.add('hide');
	
				// show game view
				gameWrapperEl.classList.remove('hide');
	
				// update list of users in room
				updatePlayerList(status.playerOne, status.playerTwo);
			}  else {
				 socket.emit('create:game', {username: username, avatar: avatar}, (status) => {
			
					console.log("Server acknowledged that user joined", status);
				
					 if (status.success) {
						 socket.emit('start:game');
						 // hide form view
						 startEl.classList.add('hide');
				
						 // show game view
						 gameWrapperEl.classList.remove('hide');
				
						 // update list of users in room
						 updatePlayerList(status.playerOne, status.playerTwo);
						 }
				
					 });
			 }
		 });
	}

 });


// How to make sure something only happens if both users pressed the virus?
virus.addEventListener('click', () => {
	let clickTime = new Date().getTime();
	virus.src = "./assets/img/virus-sad.svg";

	setTimeout(function(){
		virus.classList.add('hide');
	}, Math.floor(Math.random() * 5000))

	// when virus is clicked, randomise new numbers and send to socket
    socket.emit('virus:clicked', {
        offsetRow: Math.ceil(Math.random() * 12 ),
        offsetColumn: Math.ceil(Math.random() * 12 ),
    });
});

// move the virus using randomised numbers 
function moveVirus(offsetRow, offsetColumn) {
	
		let row = offsetRow;
		let column = offsetColumn;
		console.log('row and column', row, column);
		
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
		const addScore = document.getElementById("player1-score");
		addScore.innerHTML = `<h2>${score++}</h2>`;
	} else if (myTime === data){
		return;
	}
});

const countdown = () => {
	let countdownTime = 5;
	let countdownHTML = document.querySelector('#');
	countdownHTML.innerHTML = 'Prepare!';

	let timer = setInterval(function() {
		if(countdownTime <= 0) {
			countdownHTML.classList.add('hide');
			clearInterval(timer);
			gameWrapperEl.classList.remove('hide');
			start = Date.now();
		} else {
			countdownHTML.innerHTML = timeleft;
		}
		timeleft -= 1;
	}, 1000);
}

const startTimer = () => { 
	let minutesLabelPlayer1 = document.getElementById("minutesPlayer1");
	let secondsLabelPlayer1 = document.getElementById("secondsPlayer1");
	let minutesLabelPlayer2 = document.getElementById("minutesPlayer2");
	let secondsLabelPlayer2 = document.getElementById("secondsPlayer2");
	let totalSeconds = 0;
	setInterval(setTime, 1000);

	function setTime() {
 	++totalSeconds;
  	secondsLabelPlayer1.innerHTML = pad(totalSeconds % 60);
  	minutesLabelPlayer1.innerHTML = pad(parseInt(totalSeconds / 60));

	secondsLabelPlayer2.innerHTML = pad(totalSeconds % 60);
  	minutesLabelPlayer2.innerHTML = pad(parseInt(totalSeconds / 60));
	}

	function pad(val) {
  		let valString = val + "";
  		if (valString.length < 2) {
    		return "0" + valString;
  		} else {
    		return valString;
  		}
	}
}

        
