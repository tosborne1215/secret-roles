const { shuffleArray } = require('../../utils');

const createTeams = function (interactionCollection, gameMode) {
	let teamSize;
	if (['Team2Public', 'Team2Secret'].includes(gameMode)) {
		teamSize = 2;
	} else {
		teamSize = 3;
	}

	const totalTeams = interactionCollection.size / teamSize;
	const teamHash = {};
	const unassignedTeams = [];
	for (let i = 1; i < totalTeams + 1; i++) {
		const teamName = `Team ${i}`;
		teamHash[teamName] = [];
		for (let j = 0; j < teamSize; j++) {
			unassignedTeams.push(teamName);
		}
	}

	const availableTeams = shuffleArray(unassignedTeams);
	interactionCollection.forEach((value) => {
		const theirTeam = availableTeams.pop();
		teamHash[theirTeam].push(value);
	});

	return teamHash;
};

module.exports = {
	createTeams: createTeams,
};