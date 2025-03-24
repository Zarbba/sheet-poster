const {SlashCommandBuilder} = require('discord.js')
const Sheet = require('../../models/Sheet')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('listsheets')
		.setDescription('Lists all sheets associated with this server.'),
	async execute(interaction) {
		const guildID = interaction.guild.id
		const guildSheets = await Sheet.find({guildID})
		if (guildSheets.length > 0) {
			let displayString = ``
			guildSheets.forEach(
				(sheet) =>
					(displayString += `Name: ${sheet.sheetName} | ID: ${
						sheet.sheetID
					} | Target Range: ${
						sheet.targetRange ? sheet.targetRange : 'None'
					}\n`)
			)
			console.log(displayString)
			await interaction.reply(`${displayString}`)
		} else {
			await interaction.reply(
				`There are currently no sheets associated with this server.`
			)
		}
	},
}
