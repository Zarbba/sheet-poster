const {SlashCommandBuilder} = require('discord.js')
const Sheet = require('../../models/Sheet')
require('dotenv').config()
const {google} = require('googleapis')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('post')
		.setDescription('Manually posts the target range of a sheet.')
		.addStringOption((option) =>
			option
				.setName('sheetname')
				.setDescription('The name of the sheet you want to post from:')
				.setRequired(true)
		),
	async execute(interaction) {},
}
