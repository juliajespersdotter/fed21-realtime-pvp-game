/**
 * Game
 */

const socket = io();
const startEl = document.querySelector('#start');
const gameGrid = document.querySelector('main');
const gameWrapperEl = document.querySelector('#game-wrapper');
const usernameForm = document.querySelector('#username-form');
const chosenAvatar = document.querySelector('.avatar-wrapper');

let username = null;
let avatar = null;
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
	Object.values(players).map(username => `<li>${username}${avatar}</li>`).join("");
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

chosenAvatar.addEventListener('click', e => {
	if (e.target.tagName === 'IMG') {
		avatar = e.target;
	} 
	console.log(avatar);
})

usernameForm.addEventListener('submit', e => {
	e.preventDefault();

	if(avatar && username){
		username = usernameForm.username.value;
		console.log(`Player username is ${username}`);

	}


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

// gameGrid.addEventListener('click', e => {
// 	rounds ++;

// 	console.log(e.target);
// 	if(e.target.tagName === 'I'){
// 		e.target.parentNode.innerHTML = "";
// 		socket.emit('randomise');
// 	}
// })

function createBoard(grid) {
	// loop to create divs inside the game element
	for (let i = 0; i < width*width; i++) {
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
	const randomNumber = Math.floor(Math.random() * 54);
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
			
			e.target.parentNode.innerHTML = "";
			createVirus();

		});

	}, Math.floor(Math.random() * 10000) + 1); //add a random time the virus shows
}
