const {google} = require('googleapis')
const sheets = google.sheets('v4')
const {OAuth2} = google.auth
require('dotenv').config

// Replace these with your credentials and spreadsheet details
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = `${process.env.REDIRECT_URI_DOMAIN}/oauth/callback`
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN'
const SPREADSHEET_ID = '1PWy_Rz_9XShJvxdHBGSYDreEItuWBFWZAv8BkUty4zQ'
const RANGE = 'Sheet1!A1' // Adjust the range as needed

// Initialize OAuth2 client
const auth = new OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
auth.setCredentials({refresh_token: REFRESH_TOKEN})

async function getValues() {
	try {
		const response = await sheets.spreadsheets.values.get({
			auth,
			spreadsheetId: SPREADSHEET_ID,
			range: RANGE,
		})

		const values = response.data.values // Contains the data in the specified range
		console.log('Retrieved Values:', values)
		return values
	} catch (error) {
		console.error('Error fetching values:', error)
	}
}

console.log(getValues())
