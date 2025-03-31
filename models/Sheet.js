const mongoose = require(`mongoose`)

const sheetSchema = new mongoose.Schema({
	sheetName: {
		type: String,
		required: true,
	},
	sheetID: {
		type: String,
		required: true,
	},
	guildID: {
		type: String,
		required: true,
	},
	targetRange: String,
	refreshToken: String,
})

const Sheet = mongoose.model('Sheet', sheetSchema)

module.exports = Sheet
