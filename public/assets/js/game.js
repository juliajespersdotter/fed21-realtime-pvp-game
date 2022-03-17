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
let winner = 0;


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

// update score
const updatePlayerList = playersScore => {
	document.querySelector('#players').innerHTML = 
	Object.values(playersScore).map(winner => `<li>${winner}</li>`).join("");
}

const updateScore = score => {
	document.querySelector('#score').innerHTML = 
		Object.values(users).map(username => `<li><i class="fa-solid fa-cat-space"></i>${username}</li>`).join("");
}

socket.on('player:connected', (username) => {
	debug('New player connected', username);
});

socket.on('player:disconnected', (username) => {
	debug('Player disconnected', username);
});

socket.on('player:list', players => {
	updatePlayerList(players);
})

socket.on('score', (winner, looser) => {
	addNoticeToChat(`${winner} ${looser}`);
});

usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	username = usernameForm.username.value;

	console.log(`Player username is ${username}`);

	socket.emit('player:joined', username, (status) => {
		console.log("Server acknowledged that user joined", status);

		if (status.success) {
		// hide form view
		startEl.classList.add('hide');

		// create board
		createBoard(gameGrid);

		// show game view
		gameWrapperEl.classList.remove('hide');

		}
	});
});

gameGrid.addEventListener('click', e => {
	rounds ++;

	console.log(e.target);
	if(e.target.tagName === 'I'){
		e.target.parentNode.innerHTML = "";
		createVirus();
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

	createVirus();

}

const createVirus = () => {
	// get a random number between 0-99
	const randomNumber = Math.floor(Math.random() * 100);
	console.log(randomNumber);
	const virusIcon = `<i class="fa-solid fa-virus-covid"></i>`;

	setTimeout(function(){
		// find div with data-id with the random number
		const virus = document.querySelector(`[data-id="${randomNumber}"]`);
		virus.innerHTML = `${virusIcon}`;
		const showVirus = Date.now();
		

		//where the virus was when the player clicked
		virus.addEventListener('click', (e) => {
			//at what time did the virus show?
			let time = Date.now();

			//time between when the virus popped and the played clicked
			let playersTime = time - showVirus;

			//made into seconds
			console.log(`it took ${Math.floor(playersTime / 1000)} seconds for you to catch the virus!`);

		});

	}, Math.floor(Math.random() * 10000) + 1); //add a random time the virus shows
}

