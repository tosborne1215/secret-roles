const { shuffleArray, getRandomInt } = require('../../utils');

const LEADER = 'LEADER';
const ASSASSIN = 'ASSASSIN';
const TRAITOR = 'TRAITOR';
const GUARDIAN = 'GUARDIAN';
const createRoles = function(collection) {
	const roles = [LEADER, ASSASSIN, ASSASSIN];
	let randomInt = getRandomInt(2)
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

	return shuffleArray(roles);
};

module.exports = {
	createRoles: createRoles
}