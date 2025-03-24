const code = `4/0AQSTgQG2-ceiPdocdSh7QVYmEPAgracBQ1i3UfgFd0z0nmTFKtg2vBGVQWImMZkTz9iHBA`
const axios = require(`axios`)
const test = async () => {
	const response = await axios.post('https://oauth2.googleapis.com/token', {
		code,
		client_id: process.env.GOOGLE_CLIENT_ID,
		client_secret: process.env.GOOGLE_CLIENT_SECRET,
		redirect_uri: `${process.env.REDIRECT_URI_DOMAIN}/oauth/callback`,
		grant_type: 'authorization_code',
	})
	console.log(response.data.access_token, response.data.refresh_token)
}

test()
