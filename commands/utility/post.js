const {SlashCommandBuilder} = require('discord.js')
const Sheet = require('../../models/Sheet')
require('dotenv').config()
const {google} = require('googleapis')
const {OAuth2} = google.auth
const crypto = require('crypto')

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
	async execute(interaction) {
		const guildID = interaction.guild.id
		const sheetName = interaction.options.getString('sheetname')
		const targetSheet = await Sheet.findOne({guildID, sheetName})
		if (!targetSheet) {
			await interaction.reply(
				`Oops! We couldn't find a sheet named ${sheetName} associated with your server. 
				You can use the listsheets command to see all the sheets currently associated with your server.`
			)
			return
		}

		if (!targetSheet.refreshToken) {
			const oauth2Client = new OAuth2(
				process.env.GOOGLE_CLIENT_ID,
				process.env.GOOGLE_CLIENT_SECRET,
				`${process.env.REDIRECT_URI_DOMAIN}/oauth/callback`
			)

			const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']

			const state = crypto.randomBytes(32).toString('hex')

			const authorizationUrl = oauth2Client.generateAuthUrl({
				access_type: 'offline',
				scope: scopes,
				include_granted_scopes: true,
				state,
			})
			await interaction.reply(
				`You need to grant me access before I can post from your sheet. Please go the the following link and follow the prompts: ${authorizationUrl}`
			)
		}
	},
}
