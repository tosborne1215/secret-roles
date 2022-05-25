const createOptions = function(gameMode) {
	let notificationStrategy;
	switch (gameMode) {
	case 'Randy':
	case 'Treachery':
	case 'Special':
		notificationStrategy = 'treachery';
		break;
	case 'Team3Secret':
	case 'Team2Secret':
		notificationStrategy = 'private';
	default:
		notificationStrategy = 'public';
		break;
	}

	return {
		notificationStrategy,
		gameMode,
	};
};

module.exports = {
	createOptions: createOptions,
};
