/**
 * Game
 */


// update user list
const updatePlayerList = players => {
	document.querySelector('#online-players').innerHTML = 
		Object.values(players).map(username => `<li><span class="fa-solid fa-user-astronaut"></span>${username}<li>`).join("");
}

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

		//append divs to gameboard
		grid.appendChild(square);
	}
}

createBoard(gameGrid);
