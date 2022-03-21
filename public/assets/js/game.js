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
const updatePlayerList = (players, avatar) => {
	document.querySelector('#players').innerHTML = 
	Object.values(players).map(username => `<li>${username}</li>`).join("");

	// does not work
	//document.querySelector('.avatar').innerHTML = 
	//Object.values(avatar).map(avatar => `<li>${avatar}</li>`).join("");
}

socket.on('player:list', players => {
	updatePlayerList(players);
})

socket.on('player:connected', (username) => {
	console.log('New player connected', username);
});

socket.on('player:disconnected', (username) => {
	console.log('Player disconnected', username);
});

socket.on('start:game', () => {
	// does not do much at this point, check if players are ready?
	console.log("game started");
})

socket.on('virus:clicked', (data) => {
    moveVirus(data.offsetLeft, data.offsetTop, data.clickTime);
});

usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;
	console.log(`Player username is ${username}`);

	// make it so avatar is also sent in as a parameter in this? 
	// socket.emit('player:joined', username, avatar, (status)=>)
	socket.emit('player:joined', username, (status) => {
		console.log("Server acknowledged that user joined", status);

		if (status.success) {
		socket.emit('start:game');
		// createBoard(gameGrid);
		// hide form view
		startEl.classList.add('hide');

		// show game view
		gameWrapperEl.classList.remove('hide');

		// update list of users in room
		updatePlayerList(status.players);
		}
	});
});

// const createVirus = () => {
	// // get a random number between 0-99
	// const randomNumber = Math.floor(Math.random() * 54);
	// console.log(randomNumber);
	// const virusIcon = `<i class="fa-solid fa-virus-covid"></i>`;


		// find div with data-id with the random number
		// const virus = document.querySelector(`[data-id="${randomNumber}"]`);
		// virus.innerHTML = `${virusIcon}`;
		// let showVirus = new Date().getTime();
		

		//where the virus was when the player clicked
		// 	//at what time did the virus show?
		// 	let time =  new Date().getTime();

		// 	//time between when the virus popped and the played clicked
		// 	let playersTime = time - showVirus;

		// 	//made into seconds
		// 	console.log(`it took ${playersTime / 1000} seconds for you to catch the virus!`);

		// 	e.target.parentNode.innerHTML = "";
		// 	// createVirus();

		// });

// }


// How to make sure something only happens if both users pressed the virus?
virus.addEventListener('click', () => {
	console.log(gameGrid.clientHeight, gameGrid.clientWidth);
	console.log(virus.clientHeight, virus.clientWidth);
	let clickTime = new Date().getTime();

	// when virus is clicked, randomise new numbers and send to socket
    socket.emit('virus:clicked', {
        offsetLeft: Math.floor(Math.random() * ((gameGrid.clientWidth- virus.clientWidth)) ),
        offsetTop: Math.floor(Math.random() * ((gameGrid.clientHeight - virus.clientHeight)) ),
		clickTime
    });
})

// move the virus using randomised numbers 
function moveVirus(offLeft, offTop) {
	
		let top, left;
		
		left = offLeft;
		top = offTop;
		console.log(top, left);
		
		virus.style.top = top + 'px';
		virus.style.left = left + 'px';
		virus.style.animation = "none";
		
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
		score++;
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

//
