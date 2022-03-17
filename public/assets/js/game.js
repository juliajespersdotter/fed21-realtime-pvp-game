/**
 * Game
 */

const socket = io();
const startEl = document.querySelector('#start');
const gameGrid = document.querySelector('main');
const gameWrapperEl = document.querySelector('#game-wrapper');
const usernameForm = document.querySelector('#username-form');

let username = null;
const width = 10;
let rounds = 0;


socket.on('user:joined', username => {
	console.log("a user", username);
});


/*
Efter att användare fyllt i användarnamn och valt avatar kontrolleras ifall det finns en spelare som är redo att spela.
typ....
if (userReady) {
	prompt('Are you ready?');
} else {
	sätt diven som håller waitingroom till 'show' 
} och igen när det kommer in en spelare som vill spela så måste prompten komma upp....
*/

// update user list
const updatePlayerList = players => {
	document.querySelector('#players').innerHTML = 
	Object.values(players).map(username => `<li><span class="fa-solid  fa-user-astronaut"></span>${username}</li>`).join("");
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

socket.on('create:game', () => {
	// create board
	createBoard(gameGrid);
})

socket.on('show:virus', randomNumber => {
	const virusIcon = `<i class="fa-solid fa-virus-covid"></i>`;
        
        setTimeout(function(){
            // find div with data-id with the random number
            const virus = document.querySelector(`[data-id="${randomNumber}"]`);
            virus.innerHTML = `${virusIcon}`;
        
        }, 1000); 
})

usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = usernameForm.username.value;

	console.log(`Player username is ${username}`);

	socket.emit('player:joined', username, (status) => {
		console.log("Server acknowledged that user joined", status);

		if (status.success) {
		createBoard(gameGrid);
		// hide form view
		startEl.classList.add('hide');

		// show game view
		gameWrapperEl.classList.remove('hide');

		// update list of users in room
		updatePlayerList(status.players);

		socket.emit('show:virus', status.randomNumber);

		}
	});
});

gameGrid.addEventListener('click', e => {
	rounds ++;

	console.log(e.target);
	if(e.target.tagName === 'I'){
		e.target.parentNode.innerHTML = "";
		socket.emit('randomise');
	}
})

function createBoard(grid) {
	
	// loop to create divs inside the game element
	for (let i = 0; i < width * width; i++) {
		const square = document.createElement('div');
		square.classList.add('square');

		// give each new div a unique id
		square.dataset.id = i;

		//append divs to gameboard
		grid.appendChild(square);
	}

	socket.emit('randomise');

}

