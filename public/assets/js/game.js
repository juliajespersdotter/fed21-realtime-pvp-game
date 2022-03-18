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
	Object.values(players).map(username => `<li>${username}</li>${avatar}`).join("");
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
	// create board
	console.log("game started");
})

socket.on('virus:clicked', (data) => {
    moveVirus(data.offsetLeft, data.offsetTop, data.clickTime);
});

// socket.on('s', randomNumber => {
// 	createVirus();
// })

chosenAvatar.addEventListener('click', e => {
	if (e.target.tagName === 'IMG') {
		avatar = e.target;
	} 
	console.log(avatar);
})

usernameForm.addEventListener('submit', e => {
	e.preventDefault();
	username = usernameForm.username.value;
	console.log(`Player username is ${username}`);

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

		// socket.emit('show:virus', status.randomNumber);

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

virus.addEventListener('click', () => {
	console.log(gameGrid.clientHeight, gameGrid.clientWidth);
	console.log(virus.clientHeight, virus.clientWidth);
	let clickTime = new Date().getTime();

    socket.emit('virus:clicked', {
        offsetLeft: Math.floor(Math.random() * ((gameGrid.clientWidth- virus.clientWidth)) ),
        offsetTop: Math.floor(Math.random() * ((gameGrid.clientHeight - virus.clientHeight)) ),
		clickTime
    });
})

function moveVirus(offLeft, offTop, clickTime, showVirus,) {
	
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


