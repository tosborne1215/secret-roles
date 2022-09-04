const { shuffleArray, getRandomInt } = require('../../utils');

const LEADER = 'LEADER';
const ASSASSIN = 'ASSASSIN';
const TRAITOR = 'TRAITOR';
const GUARDIAN = 'GUARDIAN';
const USURPER = 'USURPER';
const createRoles = function(collection, gameMode) {
	let roles = [];
	switch (gameMode) {
	case 'Randy':
		roles = createRandyRoles(collection);
		break;
	case 'Special':
		roles = createSpecialRoles(collection);
		break;
	default:
		roles = createTreacheryRoles(collection);
	}

	return shuffleArray(roles);
};

const createRandyRoles = function(collection) {
	const roles = [LEADER];
	console.log(collection.size);
	for (let i = collection.size - 1; i > 0; i--) {
		const role = getRandomRole([ASSASSIN, TRAITOR, GUARDIAN, USURPER]);
		roles.push(role);
	}
	// should I do correction if they are all guardians?...nah

	return roles;
};

const createTreacheryRoles = function(collection) {
	const roles = [LEADER, ASSASSIN, ASSASSIN];
	if (collection.size === 4) {
		roles.push(getRandomRole([GUARDIAN, TRAITOR]));
	}
	else {
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
	return roles;
};

const createSpecialRoles = function(collection) {
	const roles = [LEADER, ASSASSIN, ASSASSIN];
	if (collection.size === 4) {
		roles.push(getRandomRole([GUARDIAN, TRAITOR, USURPER]));
	}
	else {
		roles.push(GUARDIAN);
	}
	if (collection.size >= 5) {
		roles.push(getRandomRole([USURPER, TRAITOR]));
	}
	if (collection.size >= 6) {
		roles.push(getRandomRole([GUARDIAN, USURPER, ASSASSIN]));
	}
	if (collection.size >= 7) {
		roles.push(getRandomRole([GUARDIAN, USURPER, ASSASSIN]));
	}
	if (collection.size >= 8) {
		roles.push(getRandomRole([GUARDIAN, USURPER, ASSASSIN]));
	}
	return roles;
};

const getRandomRole = function(roles) {
	const randomInt = getRandomInt(roles.length - 1);
	return roles[randomInt];
};

module.exports = {
	createRoles: createRoles,
};
