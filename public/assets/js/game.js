/**
 * Game
 */

/**
 * @todo 
 * - eventlistener for submitting form 🤩
 * - create gameboard 🧐
 * - formula for shuffling virus 
 * 
 */

const socket = io();
const startEl = document.querySelector('#start');
const gameGrid = document.querySelector('main');
const gameWrapperEl = document.querySelector('#game-wrapper');
const usernameForm = document.querySelector('#username-form');

let username = null;
const width = 10;



/*
Efter att användare fyllt i användarnamn och valt avatar kontrolleras ifall det finns en spelare som är redo att spela.
typ....
if (userReady) {
	prompt('Are you ready?');
} else {
	sätt diven som håller waitingroom till 'show' 
} och igen när det kommer in en spelare som vill spela så måste prompten komma upp....
*/

addEventListener('submit', e => {
	e.preventDefault();

	username = usernameForm.username.value;

	console.log(`Player username is ${username}`);

	//socket.emit('user:joined', username, (status) => {
		//console.log("Server acknowledged that user joined", status);

		//if (status.success) {
			// hide form view
		startEl.classList.add('hide');

			// show game view
		gameWrapperEl.classList.remove('hide');

		//}
	//});
});

function createBoard(grid) {
	
	// loop to create divs inside the game element
	for (let i = 0; i < width * width; i++) {
		const square = document.createElement('div');
		square.classList.add('square');

		// give each new div a unique id
		square.dataset.id = i;
		console.log(square);

		//append divs to gameboard
		grid.appendChild(square);

	}

	// get a random number between 0-99
	const randomNumber = Math.floor(Math.random() * 100);
	console.log(randomNumber);

	// find div with data-id with the random number
	const virus = document.querySelector(`[data-id="${randomNumber}"]`);

	// make chosen div green
	virus.classList.add('green');

}

createBoard(gameGrid);

// const socket = io();


// <i class="fa-solid fa-user-astronaut"></i>
// <i class="fa-solid fa-user-bounty-hunter"></i>
// <i class="fa-solid fa-user-cowboy"></i>
// <i class="fa-solid fa-user-crown"></i>
// <i class="fa-solid fa-user-ninja"></i>
// <i class="fa-solid fa-user-police"></i>
// <i class="fa-solid fa-user-robot"></i>
// <i class="fa-solid fa-alien-8bit"></i>
// <i class="fa-solid fa-pinata"></i>
// <i class="fa-solid fa-user-secret"></i>

// * virus icon
// <i class="fa-solid fa-virus-covid"></i>
