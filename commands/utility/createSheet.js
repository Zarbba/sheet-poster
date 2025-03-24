const {SlashCommandBuilder} = require('discord.js')
const Sheet = require('../../models/Sheet')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('createsheet')
		.setDescription('Creates a new sheet for sheet-poster to access.')
		.addStringOption((option) =>
			option
				.setName('sheetname')
				.setDescription('The name of your sheet:')
				.setRequired(true)
		)
		.addStringOption((option) =>
			option
				.setName('sheetid')
				.setDescription('The ID of your sheet:')
				.setRequired(true)
		),
	async execute(interaction) {
		const sheetName = interaction.options.getString('sheetname')
		const sheetID = interaction.options.getString('sheetid')
		const guildID = interaction.guild.id
		//TODO - Add validation to ensure that there are no duplicate sheet names for a given guild
		const newSheet = await Sheet.create({
			sheetName,
			sheetID,
			guildID,
		})
		if (newSheet) {
			await interaction.reply(`${sheetName} created successfully.`)
		} else {
			await interaction.reply(`Sheet creation failed.`)
		}
	},
}
