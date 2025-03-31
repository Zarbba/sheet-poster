const {SlashCommandBuilder, MessageFlags} = require('discord.js')
const Sheet = require('../../models/Sheet')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setrange')
		.setDescription(
			'Sets a new target range for a sheet connected to this server.'
		)
		.addStringOption((option) =>
			option
				.setName('sheetname')
				.setDescription('The name of the sheet you want to update:')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('targetrange')
				.setDescription('The target range:')
				.setRequired(true)
		),
	async execute(interaction) {
		const sheetName = interaction.options.getString('sheetname')
		const targetRange = interaction.options.getString('targetrange')
		const guildID = interaction.guild.id
		const updatedSheet = await Sheet.updateOne(
			{
				sheetName,
				guildID,
			},
			{
				targetRange,
			}
		)
		if (!updatedSheet || updatedSheet.matchedCount === 0) {
			await interaction.reply({
				flags: MessageFlags.Ephemeral,
				content: `I couldn't find a sheet named ${sheetName} associated with your server.`,
			})
		} else {
			await interaction.reply({
				content: `The sheet named ${sheetName} has been updated to have a target range of ${targetRange}`,
				flags: MessageFlags.Ephemeral,
			})
		}
	},
}
