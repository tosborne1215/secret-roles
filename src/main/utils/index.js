const dedupeUsers = (collection) => {
	const existingUsers = {};
	const stuff = collection.filter((value) => {
		if (existingUsers[value.user.id] === 1) {
			return false;
		}
		else {
			existingUsers[value.user.id] = 1;
			return true;
		}
	});
	return stuff;
};

const shuffleArray = (array) => {
	for (let i = array.length - 1; i > 0; i--) {
		const randNum = Math.floor(Math.random() * (i + 1));

		const temp = array[i];
		array[i] = array[randNum];
		array[randNum] = temp;
	}

	return array;
}

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

module.exports = {
	shuffleArray: shuffleArray,
	dedupeUsers: dedupeUsers,
	getRandomInt: getRandomInt
}