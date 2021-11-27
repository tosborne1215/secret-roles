const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-session')
		.setDescription('starts a f*cking session.'),
	async execute(interaction) {
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('primary')
					.setLabel('Click to join session')
					.setStyle('PRIMARY'),
			);
		const message = await interaction.reply({ content: 'Join the session you fucking nerds!', components: [row], fetchReply: true });
		const collector = message.createMessageComponentCollector({ time: 15000 });

		collector.on('collect', async i => {
			await i.deferUpdate({ content: 'Join the session you fucking nerds!' });
			const messageStr = `${i.user.username} joined the session.`;
			await i.guild.channels.fetch(i.channelId).then(async (channel) => {
				await channel.send(messageStr);
			});
		});

		collector.on('end', async collected => {
			const newCollection = dedupeUsers(collected);
			const roles = determineRoles(newCollection);
			let kingsName = '';
			if (newCollection.size >= 4) {
				newCollection.forEach(async (value, index, obj) => {
					const pickedRole = roles.pop();
					if (pickedRole === LEADER) {
						kingsName = value.member.user.username;
					}
					const str = `Hey, your role is ${pickedRole}`;
					await value.member.send({ content: str });
				});
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = `This concludes joining the session. ${kingsName} is your leader. Good luck with that fuckup.`;
					await channel.send(messageStr);
				});
			}
			else {
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = 'Fuckwads! You need 4 or more people to join!';
					await channel.send(messageStr);
				});
			}
		});
	},
};

const dedupeUsers = function(collection) {
	const existingUsers = {};
	return collection.filter((value) => {
		if (existingUsers[value] === 1) {
			return false;
		}
		else {
			existingUsers[value] = 1;
			return true;
		}
	});
};

const LEADER = 'LEADER';
const ASSASSIN = 'ASSASSIN';
const TRAITOR = 'TRAITOR';
const GUARDIAN = 'GUARDIAN';
const determineRoles = function(collection) {
	const roles = [LEADER, ASSASSIN, ASSASSIN, TRAITOR];
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

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const randNum = Math.floor(Math.random() * (i + 1));

		const temp = array[i];
		array[i] = array[randNum];
		array[randNum] = temp;
	}

	return array;
}