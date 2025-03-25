const {google} = require('googleapis')
const {OAuth2} = google.auth
const crypto = require('crypto')
const app = require('express')
require(`dotenv`).config()

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

// const test = async () => {
// 	const {tokens} = await oauth2Client.getToken(
// 		'4/0AQSTgQHnWfxZ-EcqcNiGUsZ-EwwvxVYhw4bBlAbzNWH9E7qL2oBwSE_ogfA5BOkoW1Bpyw'
// 	)
// 	console.log('Access Token:', tokens.access_token)
// 	console.log('Refresh Token:', tokens.refresh_token)
// }

// console.log(test())
