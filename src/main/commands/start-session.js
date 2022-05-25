const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { dedupeUsers, getText } = require('../utils');
const { createRoles } = require('../role/creator');
const { createTeams } = require('../team/creator');
const { createOptions } = require('../session');
const { validateTeamSize } = require('../validation');

const setupSession = async function(interaction) {
	let gameMode;
	if (interaction.options.get('type') === null) {
		gameMode = 'Treachery';
	}
	else {
		gameMode = interaction.options.get('type').value;
	}
	return createOptions(gameMode);
};


module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-session')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('Type of session. I.E. Treachery, Randy, or various team options')
				.addChoice('Treachery', 'Treachery')
				.addChoice('Randy', 'Randy')
				.addChoice('Special', 'Special')
				.addChoice('Teams of 2 (public)', 'Team2Public')
				.addChoice('Teams of 2 (secret)', 'Team2Secret')
				.addChoice('Teams of 3 (public)', 'Team3Public')
				.addChoice('Teams of 3 (secret)', 'Team3Secret'),
		)
		.setDescription('starts a f*cking session.'),
	async execute(interaction) {
		const guildId = interaction.guild.id;
		const options = await setupSession(interaction);
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('primary')
					.setLabel('Click to join session')
					.setStyle('PRIMARY'),
			);
		const message = await interaction.reply({ content: getText('session.join', { vars: { gameMode: options.gameMode } }), components: [row], fetchReply: true });
		const collector = message.createMessageComponentCollector({ time: 60000 });

		collector.on('collect', async i => {
			await i.deferUpdate({ content: getText('session.join') });
			const messageStr = getText('user.joined', { vars: { username: i.user.username }, userId: i.user.id });
			await i.guild.channels.fetch(i.channelId).then(async (channel) => {
				await channel.send(messageStr);
			});
		});

		collector.on('end', async collected => {
			const newCollection = dedupeUsers(collected);
			const response = validateTeamSize(options.gameMode, newCollection.size);
			if (!response.status) {
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = getText(response.msg, { guild: guildId });
					await channel.send(messageStr);
				});
			}

			switch (options.notificationStrategy) {
				case 'treachery':
					await treacheryAssignerNotifier(interaction, message, newCollection, options);
					break;
				case 'public':
				case 'private':
					await teamAssignerNotifier(interaction, message, newCollection, options);
					break;
			}
		});
	},
};

const treacheryAssignerNotifier = async function(interaction, message, interactionCollection, options) {
	const roles = createRoles(interactionCollection, options.gameMode);
	let kingsName = '';
	let kingsUserId = '';
	interactionCollection.forEach(async (value) => {
		try {
			const pickedRole = roles.pop();
			if (pickedRole === 'LEADER') {
				kingsName = value.member.user.username;
				kingsUserId = value.member.user.id;
			}
			const str = getText('user.role', { vars: { role: pickedRole }, userId: value.user.id });
			await value.user.send({ content: str });
		}
		catch (ex) {
			console.error(`this guy fucked it up ${value.member.user.username}`, ex);
		}
	});

	await message.guild.channels.fetch(message.channelId).then(async (channel) => {
		const messageStr = getText('session.conclude') + ' ' + getText('user.chosen', { vars: { username: kingsName }, kingsUserId });
		await channel.send(messageStr);
	});
};

const teamAssignerNotifier = async function(interaction, message, interactionCollection, options) {
	const teams = createTeams(interactionCollection, options.gameMode);
	let optional = '';
	for (const [key, value] of Object.entries(teams)) {
		console.log(`${key}: ${value}`);
		const team = [];
		value.forEach((member) => {
			team.push(member.member.user.username);
		});

		if (options.notificationStrategy === 'private') {
			const message = getText('user.team', {team: team.join(' ')});
			value.forEach(async (member) => {
				await member.user.send({ content: message });
			});
		} else {
			optional.push(`${key} is ${team.join(',')}`);
		}
	}

	await message.guild.channels.fetch(message.channelId).then(async (channel) => {
		const messageStr = getText('session.conclude') + ' ' + optional.join('\n');
		await channel.send(messageStr);
	});
};
