const {
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
	ActionRowBuilder,
	ModalBuilder,
	EmbedBuilder,
	ButtonBuilder,
	ButtonStyle,
	Component,
	MessageFlags,
	Client,
} = require('discord.js')
const Sheet = require('../../models/Sheet')
require('dotenv').config()
const {google} = require('googleapis')
const {OAuth2} = google.auth
const crypto = require('crypto')
const sheets = google.sheets('v4')

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
			await interaction.reply({
				content: `Oops! We couldn't find a sheet named ${sheetName} associated with your server. You can use the listsheets command to see all the sheets currently associated with your server.`,
				flags: MessageFlags.Ephemeral,
			})
			return
		}

		const oauth2Client = new OAuth2(
			process.env.GOOGLE_CLIENT_ID,
			process.env.GOOGLE_CLIENT_SECRET,
			`${process.env.REDIRECT_URI_DOMAIN}/oauth/callback`
		)

		if (!targetSheet.refreshToken) {
			const state = crypto.randomBytes(32).toString('hex')
			const scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly']

			const authorizationUrl = oauth2Client.generateAuthUrl({
				access_type: 'offline',
				scope: scopes,
				include_granted_scopes: true,
				state,
			})

			const codeModal = new ModalBuilder()
				.setCustomId('codeModal')
				.setTitle('Provide Authorization Code')

			const codeInput = new TextInputBuilder()
				.setCustomId('codeInput')
				.setLabel('Your authorization code:')
				.setStyle(TextInputStyle.Short)

			const modalActionRow = new ActionRowBuilder().addComponents(codeInput)

			codeModal.addComponents(modalActionRow)

			const cancel = new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Secondary)

			const authLinkButton = new ButtonBuilder()
				.setLabel('Acquire Authorization Code')
				.setURL(`${authorizationUrl}`)
				.setStyle(ButtonStyle.Link)

			const openModalButton = new ButtonBuilder()
				.setCustomId('openModalButton')
				.setLabel('Provide Authorization Code')
				.setStyle(ButtonStyle.Primary)

			const messageActionRow = new ActionRowBuilder().addComponents(
				cancel,
				authLinkButton,
				openModalButton
			)

			const response = await interaction.reply({
				content: `I need permission before I can do that. Please go to the link below, follow the prompts and provide me with the authorization code.`,
				components: [messageActionRow],
				withResponse: true,
				flags: MessageFlags.Ephemeral,
			})

			const collectorFilter = (i) => i.user.id === interaction.user.id

			const confirmation =
				await response.resource.message.awaitMessageComponent({
					filter: collectorFilter,
					time: 900_000,
				})

			if (confirmation.customId === 'openModalButton') {
				await confirmation.showModal(codeModal)
				await confirmation
					.awaitModalSubmit({
						time: 900_000,
						filter: collectorFilter,
					})
					.then(async (modalResponse) => {
						modalResponse.reply({
							content: 'Thank you for providing an authorization code.',
							flags: MessageFlags.Ephemeral,
						})
						const code = modalResponse.fields.getTextInputValue('codeInput')

						const {tokens} = await oauth2Client.getToken(code)
						accessToken = tokens.access_token
						const refreshToken = tokens.refresh_token
						targetSheet.refreshToken = refreshToken
						await targetSheet.save()
					})
					.catch((err) => {
						console.log(err)
						confirmation.editReply({
							content: 'No submission was received in the allowed time.',
							flags: MessageFlags.Ephemeral,
						})
					})
			} else if (confirmation.customId === 'cancel') {
				await confirmation.update({
					content: 'Action cancelled',
					components: [],
					flags: MessageFlags.Ephemeral,
				})
			}
		}

		oauth2Client.setCredentials({refresh_token: targetSheet.refreshToken})
		let values
		try {
			const response = await sheets.spreadsheets.values.get({
				auth: oauth2Client,
				spreadsheetId: targetSheet.sheetID,
				range: targetSheet.targetRange,
			})
			values = response.data.values
			console.log('🚀 ~ execute ~ values:', values)
		} catch (err) {
			console.error('Error fetching values:', err)
		}

		await interaction.reply(`${values}`)
	},
}
