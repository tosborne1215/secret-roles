const validateTeamSize = function (gameMode, players) {
	if (['Treachery', 'Randy', 'Special'].includes(gameMode)) {
		if (players < 4) {
			return { status: false, msg: 'error.not.enough.players'};
		}
	}
	if (['Team2Public', 'Team2Secret'].includes(gameMode)) {
		if (players % 2 !== 0) {
			return { status: false, msg: 'error.not.enough.players'};
		}
	}
	if (['Team3Public', 'Team3Secret'].includes(gameMode)) {
		if (players % 3 !== 0) {
			return { status: false, msg: 'error.not.enough.players'};
		}
	}
	return { status: true };
};

module.exports = {
	validateTeamSize: validateTeamSize,
};