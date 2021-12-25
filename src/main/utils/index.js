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

String.prototype.interpolate = function(params) {
	if (!!params === false) {
		return this.toString()
	}
  const names = Object.keys(params);
  const vals = Object.values(params);
  return new Function(...names, `return \`${this}\`;`)(...vals);
}

const getText = (key, options) => {
	const { vars, userId, guild } = options || {}

	let dataArr = {};
	if (!!userId) {
		dataArr = getYaml(`./resources/user.${userId}.yml`)
	} else if (!!guild) {
		dataArr = getYaml(`./resources/guild.${guild}.yml`)
	}

	if (!dataArr || !Object.keys(dataArr).includes(key)) {
		dataArr = getYaml('./resources/default.yml')
	}

	let data = null
	if (Array.isArray(dataArr[key])) {
		data = dataArr[key][getRandomInt(dataArr[key].length)]
	} else {
		data = dataArr[key]
	}

	return data.interpolate(vars)
}

const getYaml = (file) => {
	const fs = require('fs');
	const yaml = require('js-yaml')

	try {
	    const fileContents = fs.readFileSync(file, 'utf8');
	    return yaml.load(fileContents);
	} catch (e) {
		if (e instanceof Error && e.message.includes("no such file or directory")) {
			console.log(`${file} not found.`)
		} else {
			console.log(typeof e);
		}
	  return null
	}
}

module.exports = {
	shuffleArray: shuffleArray,
	dedupeUsers: dedupeUsers,
	getRandomInt: getRandomInt,
	getText: getText
}