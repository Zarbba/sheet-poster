//----------------------- Imports
const {
	Client,
	Collection,
	Events,
	GatewayIntentBits,
	MessageFlags,
} = require('discord.js')
require('dotenv').config()
const fs = require('node:fs')
const path = require('node:path')
const foldersPath = path.join(__dirname, 'commands')
const commandFolders = fs.readdirSync(foldersPath)
const express = require(`express`)
const app = express()

//----------------------- Express - Config
app.use(express.urlencoded({extended: true}))
app.use(express.json())
app.listen(process.env.PORT, () => {
	console.log(`Server listening at http://localhost:${process.env.PORT}/`)
})

//----------------------- MongoDB - Setup
const mongoose = require(`mongoose`)
mongoose.connect(process.env.MONGODB_URI)
const Sheet = require('./models/Sheet')
const {json} = require('node:stream/consumers')

//----------------------- Redireciton Route
app.get(`/oauth/callback`, async (req, res) => {
	const authorizationCode = req.query.code
	console.log('🚀 ~ app.get ~ authorizationCode:', authorizationCode)

	res.status(200).send(`${authorizationCode}`)
})

//----------------------- Discord - Config
const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
})

client.commands = new Collection()

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder)
	const commandFiles = fs
		.readdirSync(commandsPath)
		.filter((file) => file.endsWith('.js'))
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file)
		const command = require(filePath)
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command)
		} else {
			console.log(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			)
		}
	}
}

client.login(process.env.DISCORD_TOKEN)

//----------------------- Discord - Load Slash commands
client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return

	const command = interaction.client.commands.get(interaction.commandName)

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`)
		return
	}
	try {
		await command.execute(interaction)
	} catch (error) {
		console.error(error)
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			})
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			})
		}
	}
})
