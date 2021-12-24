const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const { dedupeUsers } = require('../utils');
const { createRoles } = require('../role/creator');

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
		const collector = message.createMessageComponentCollector({ time: 20000 });

		collector.on('collect', async i => {
			await i.deferUpdate({ content: 'Join the session you fucking nerds!' });
			const messageStr = `${i.user.username} joined the session.`;
			await i.guild.channels.fetch(i.channelId).then(async (channel) => {
				await channel.send(messageStr);
			});
		});

		collector.on('end', async collected => {
			const newCollection = dedupeUsers(collected);
			const roles = createRoles(newCollection);
			let kingsName = '';
			if (newCollection.size >= 4) {
				newCollection.forEach(async (value) => {
					try {
						const pickedRole = roles.pop();
						if (pickedRole === LEADER) {
							kingsName = value.member.user.username;
						}
						const str = `Hey, your role is ${pickedRole}`;
						await value.user.send({ content: str });
					} catch (ex) {
						console.error(`this guy fucked it up ${value.member.user.username}`, ex);
					}
				});
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = `This concludes joining the session. ${kingsName} is your leader. Good luck with that fuckup.`;
					await channel.send(messageStr);
				});
			}
			else {
				await message.guild.channels.fetch(message.channelId).then(async (channel) => {
					const messageStr = 'Motherfuckers!! You need 4 or more people to join!';
					await channel.send(messageStr);
				});
			}
		});
	},
};
