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
const createGame = document.querySelector('#createGame');
const joinGame = document.querySelector('#joinGame');

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
const updatePlayerList = (playerOne, playerTwo, avatar) => {
	document.querySelector('#players').innerHTML = 
	 `<li>${playerOne}</li><li>${playerTwo}</li>`;

	// does not work
	//document.querySelector('.avatar').innerHTML = 
	//Object.values(avatar).map(avatar => `<li>${avatar}</li>`).join("");
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
})

socket.on('already:joined', data => {
	console.log("You are already in an existing game " + data.gameId);
})

socket.on('join:success', data => {
	console.log("You joined the game " + data.gameId);
})

socket.on('virus:clicked', (data) => {
	moveVirus(data.offsetLeft, data.offsetTop, data.clickTime);
});

createGame.addEventListener('click', e => {
	e.preventDefault();
	username = usernameForm.username.value;
	console.log(`Player username is ${username}`);
	socket.emit('create:game', username, (status) => {
		
	console.log("Server acknowledged that user joined", status);

	if (status.success) {
		socket.emit('start:game');
		// createBoard(gameGrid);
		
		// hide form view
		startEl.classList.add('hide');

		// show game view
		gameWrapperEl.classList.remove('hide');

		// update list of users in room
		updatePlayerList(status.playerOne, status.playerTwo);
		}

	});
});

joinGame.addEventListener('click', e => {
	e.preventDefault();
	username = usernameForm.username.value;
	console.log(`Player username is ${username}`);

	socket.emit('join:game', username, (status) => {
		
		console.log("Server acknowledged that user joined", status);

		if (status.success) {
			socket.emit('start:game');
			// createBoard(gameGrid);
			// hide form view
			startEl.classList.add('hide');

			// show game view
			gameWrapperEl.classList.remove('hide');

			// update list of users in room
			updatePlayerList(status.playerOne, status.playerTwo);
		} else  {
		 	socket.emit('create:game', username, (status) => {
		
				console.log("Server acknowledged that user joined", status);
			
		 		if (status.success) {
		 			socket.emit('start:game');
		 			// createBoard(gameGrid);
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
 });


// How to make sure something only happens if both users pressed the virus?
virus.addEventListener('click', () => {
	let clickTime = new Date().getTime();

	// when virus is clicked, randomise new numbers and send to socket
    socket.emit('virus:clicked', {
        offsetLeft: Math.floor(Math.random() * ((gameGrid.clientWidth- virus.clientWidth)) ),
        offsetTop: Math.floor(Math.random() * ((gameGrid.clientHeight - virus.clientHeight)) ),
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


