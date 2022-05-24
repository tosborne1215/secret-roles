const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { dedupeUsers, getText } = require('../utils');
const { createRoles } = require('../role/creator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('start-session')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('Type of session. I.E. Treachery, Randy, or various team options')
				.addChoice('Treachery', 'Treachery')
				.addChoice('Randy', 'Randy')
				.addChoice('Teams of 2 (public)', 'Team2Public')
				.addChoice('Teams of 2 (secret)', 'Team2Secret')
				.addChoice('Teams of 3 (public)', 'Team3Public')
				.addChoice('Teams of 3 (private)', 'Team3Private')
				.addChoice('Special', 'Special')
		)
		.setDescription('starts a f*cking session.'),
	async execute(interaction) {
		let gameMode = interaction.options.get('type')
		if (interaction.options.get('type') === null) {
			gameMode = 'Treachery';
		} else {
			gameMode = interaction.options.get('type').value
		}
		if (gameMode !== 'Treachery' && gameMode !== 'Randy') {
			await interaction.reply({ content: getText('error.not.implemented'), fetchReply: true });
			return
		}
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId('primary')
					.setLabel('Click to join session')
					.setStyle('PRIMARY'),
			);
		const message = await interaction.reply({ content: getText('session.join', { vars: { gameMode: gameMode }}), components: [row], fetchReply: true });
		const collector = message.createMessageComponentCollector({ time: 20000 });

		collector.on('collect', async i => {
			await i.deferUpdate({ content: getText('session.join') });
			const messageStr = getText('user.joined', { vars: { username: i.user.username }, userId: i.user.id});
			await i.guild.channels.fetch(i.channelId).then(async (channel) => {
				await channel.send(messageStr);
			});
		});

		collector.on('end', async collected => {
			const newCollection = dedupeUsers(collected);
			const roles = createRoles(newCollection, gameMode);
			let kingsName = '';
			let kingsUserId = ''
			const guildId = interaction.guild.id
			if (newCollection.size >= 4) {
				newCollection.forEach(async (value) => {
					try {
						const pickedRole = roles.pop();
						if (pickedRole === "LEADER") {
							kingsName = value.member.user.username;
							kingsUserId = value.member.user.id
						}
						const str = getText('user.role', { vars: { role: pickedRole}, userId: value.user.id });
						await value.user.send({ content: str });
					} catch (ex) {
						console.error(`this guy fucked it up ${value.member.user.username}`, ex);
					}
				});
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = getText('session.conclude') + " " + getText('user.chosen', { vars: { username: kingsName }, kingsUserId});
					await channel.send(messageStr);
				});
			}
			else {
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = getText("error.not.enough.players", { guild: guildId });
					await channel.send(messageStr);
				});
			}
		});
	},
};
