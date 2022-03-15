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