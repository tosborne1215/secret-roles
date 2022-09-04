const { SlashCommandBuilder } = require('@discordjs/builders');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

const join = async function(interaction, button, currentMessage) {
	await button.deferUpdate();
	const messageStr = '\n' + getText('user.joined', { vars: { username: button.user.username }, userId: button.user.id });
	currentMessage += messageStr;
	await interaction.editReply({ content: currentMessage });

	return currentMessage;
};

const start = async function(collector, button, interaction, currentMessage) {
	if (interaction.user.userId != button.user.userId) {
		await button.reply({ content: 'These buttons aren\'t for you!', ephemeral: true });
	}
	else {
		await button.update({ components: [] });
		await collector.stop();
	}
};

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-session')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('Type of session. I.E. Treachery, Randy, or various team options')
				.addChoices(
					{ name: 'Treachery', value: 'Treachery' },
					{ name: 'Randy', value: 'Randy' },
					{ name: 'Special', value: 'Special' },
					{ name: 'Teams of 2 (public)', value: 'Team2Public' },
					{ name: 'Teams of 2 (secret)', value: 'Team2Secret' },
					{ name: 'Teams of 3 (public)', value: 'Team3Public' },
					{ name: 'Teams of 3 (secret)', value: 'Team3Seceret' },
				),
		)
		.setDescription('starts a f*cking session.'),
	async execute(interaction) {
		const guildId = interaction.guild.id;
		const options = await setupSession(interaction);
		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('join')
					.setLabel('Click to join session')
					.setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
					.setCustomId('start')
					.setLabel('Start')
					.setStyle(ButtonStyle.Secondary),
			);
		let currentMessage = getText('session.join', { vars: { gameMode: options.gameMode } });
		const message = await interaction.reply({ content: currentMessage, components: [row], fetchReply: true });
		const collector = message.createMessageComponentCollector({ time: 480000 });

		collector.on('collect', async button => {
			switch (button.customId) {
			case 'join':
				currentMessage = await join(interaction, button, currentMessage);
				break;
			case 'start':
				await start(collector, button, interaction);
				break;
			default:
				console.error('Button not recognized ' + button.customId);
				break;
			}
		});

		collector.on('end', async collected => {
			const newCollection = dedupeUsers(collected);
			const response = validateTeamSize(options.gameMode, newCollection.size);
			if (response.status === false) {
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = getText(response.msg, { guild: guildId });
					await channel.send(messageStr);
				});
				return;
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
			await value.followUp({ content: str, ephemeral: true });
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
	const optional = [];
	for (const [key, value] of Object.entries(teams)) {
		const team = [];
		value.forEach((member) => {
			team.push(member.member.user.username);
		});
		if (options.notificationStrategy === 'private') {
			const messageStr = getText('user.team', { vars: { team: team.join(' ') } });
			value.forEach(async (member) => {
				await member.user.send({ content: messageStr });
			});
		}
		else {
			optional.push(`${key} is ${team.join(',')}`);
		}
	}

	await message.guild.channels.fetch(message.channelId).then(async (channel) => {
		const messageStr = getText('session.conclude') + '\n' + optional.join('\n');
		await channel.send(messageStr);
	});
};
