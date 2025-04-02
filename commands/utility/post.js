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

			const refreshTokenModal = new ModalBuilder()
				.setCustomId('refreshTokenModal')
				.setTitle('Provide Refresh Token')

			const refreshTokenInput = new TextInputBuilder()
				.setCustomId('refreshTokenInput')
				.setLabel('Your refresh token:')
				.setStyle(TextInputStyle.Short)

			const modalActionRow = new ActionRowBuilder().addComponents(
				refreshTokenInput
			)

			refreshTokenModal.addComponents(modalActionRow)

			const cancel = new ButtonBuilder()
				.setCustomId('cancel')
				.setLabel('Cancel')
				.setStyle(ButtonStyle.Secondary)

			const authLinkButton = new ButtonBuilder()
				.setLabel('Acquire Refresh Token')
				.setURL(`${authorizationUrl}`)
				.setStyle(ButtonStyle.Link)

			const openModalButton = new ButtonBuilder()
				.setCustomId('openModalButton')
				.setLabel('Provide Refresh Token')
				.setStyle(ButtonStyle.Primary)

			const messageActionRow = new ActionRowBuilder().addComponents(
				cancel,
				authLinkButton,
				openModalButton
			)

			const response = await interaction.reply({
				content: `I need permission before I can do that. Open the link provided to acquire a refresh token, then provide that to me so I can gain access.`,
				components: [messageActionRow],
				withResponse: true,
				flags: MessageFlags.Ephemeral,
			})

			// const collectorFilter = (i) => i.user.id === interaction.user.id

			// const confirmation =
			// 	await response.resource.message.awaitMessageComponent({
			// 		filter: collectorFilter,
			// 		time: 900_000,
			// 	})

			// if (confirmation.customId === 'openModalButton') {
			// 	await confirmation.showModal(refreshTokenModal)
			// 	await confirmation
			// 		.awaitModalSubmit({
			// 			time: 900_000,
			// 			filter: collectorFilter,
			// 		})
			// 		.then(async (modalResponse) => {
			// 			modalResponse.reply('Thank you for providing a refresh token.')
			// 			const refreshToken =
			// 				modalResponse.fields.getTextInputValue('refreshTokenInput')
			// 			targetSheet.refreshToken = refreshToken
			// 			await targetSheet.save()
			// 		})
			// 		.catch((err) => {
			// 			console.log(err)
			// 			confirmation.editReply({
			// 				content: 'No submission was received in the allowed time.',
			// 				flags: MessageFlags.Ephemeral,
			// 			})
			// 		})
			// 	try {
			// 	} catch (err) {}
			// } else if (confirmation.customId === 'cancel') {
			// 	await confirmation.update({
			// 		content: 'Action cancelled',
			// 		components: [],
			// 		flags: MessageFlags.Ephemeral,
			// 	})
			// }
		}
	},
}
