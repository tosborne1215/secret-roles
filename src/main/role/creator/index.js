const { shuffleArray, getRandomInt } = require('../../utils');

const LEADER = 'LEADER';
const ASSASSIN = 'ASSASSIN';
const TRAITOR = 'TRAITOR';
const GUARDIAN = 'GUARDIAN';
const createRoles = function(collection, gameMode) {
	let roles = []
	switch(gameMode) {
		case 'Randy':
			roles = createRandyRoles(collection);
			break;
		default:
			roles = createTreacheryRoles(collection);
	}

	return shuffleArray(roles);
};

const createRandyRoles = function(collection) {
	let roles = [LEADER]
	console.log(collection.size)
	for (let i = collection.size - 1; i > 0; i--) {
		const randomInt = getRandomInt(3);
		console.log(randomInt)
		switch (randomInt) {
			case 0:
				console.log(ASSASSIN)
				roles.push(ASSASSIN)
				break;
			case 1:
			console.log(TRAITOR)
				roles.push(TRAITOR)
				break;
			case 2:
			console.log(GUARDIAN)
				roles.push(GUARDIAN)
				break;
		}
	}
	// should I do correction if they are all guardians?...nah

	return roles;
};

const createTreacheryRoles = function(collection) {
	const roles = [LEADER, ASSASSIN, ASSASSIN];
	const randomInt = getRandomInt(2)
	if (collection.size == 4 || randomInt === 1) {
		roles.push(GUARDIAN);
	} else {
		roles.push(TRAITOR);
	}
	if (collection.size >= 5) {
		roles.push(GUARDIAN);
	}
	if (collection.size >= 6) {
		roles.push(ASSASSIN);
	}
	if (collection.size >= 7) {
		roles.push(GUARDIAN);
	}
	if (collection.size >= 8) {
		roles.push(TRAITOR);
	}
	return roles
}

module.exports = {
	createRoles: createRoles
}