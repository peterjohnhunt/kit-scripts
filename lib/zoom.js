let express = await npm('express')


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Database
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

let zoomDb = db("zoom", {
  client_id: null,
  client_secret: null,
  access_token: null,
  refresh_token: null,
  ids: [],
  cache: {},
})


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Constants
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

const authBase = 'https://zoom.us/oauth'
const apiBase  = 'https://api.zoom.us/v2'

const clientId     = zoomDb.get('client_id')
const clientSecret = zoomDb.get('client_secret')
const accessToken  = zoomDb.get('access_token')
const refreshToken = zoomDb.get('refresh_token')
const cache        = zoomDb.get('cache')

const redirectUri  = encodeURIComponent('http://scriptkit.usefulgroup.com')

const headers = {
  "Content-Type" : "application/json; charset=utf-8",
  "Accept"       : "application/json"
}

//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Authentication
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

const getClientId = async () => {
  let clientId = await arg('Enter your client id')

  zoomDb.set('client_id', clientId).write()
}

const getClientSecret = async () => {
  let clientSecret = await arg('Enter your client secret')

  zoomDb.set('client_secret', clientSecret).write()
}

const getTokens = async (clientId, redirectUri) => {
  const app = express();
  
  app.get('/', handleRequest)
  
  let server = await app.listen(3003)
  
  exec(`open "${authBase}/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}"`)

  setPlaceholder('Check your browser to continue')

  while ( !refreshToken.value() ) {
    await wait(2000)
  }

  server.close()
}

const handleRequest = async (req, res) => {
  let { code } = req.query

  if ( code ) await getAccessToken(code, clientId.value(), clientSecret.value(), redirectUri)
  
  res.end('Authenticated! You may now close this browser tab');
}

const getAccessToken = async (authCode, clientId, clientSecret, redirectUri) => {

  let authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  let response = await post(`${authBase}/token?grant_type=authorization_code&redirect_uri=${redirectUri}&code=${authCode}`, {}, {
    headers: { Authorization: `Basic ${authorization}`}
  })
  
  let { access_token, refresh_token } = response.data

  zoomDb.set('access_token', access_token).write()
  zoomDb.set('refresh_token', refresh_token).write()
}

const refreshTokens = async (token, clientId, clientSecret) => {
  let authorization = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  let response = await post(`${authBase}/token?grant_type=refresh_token&refresh_token=${token}`, {}, {
    headers: { Authorization: `Basic ${authorization}`}
  })

  let { access_token, refresh_token } = response.data

  zoomDb.set('access_token', access_token).write()
  zoomDb.set('refresh_token', refresh_token).write()
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Custom
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

export let zoom = zoomDb.get("ids")

export let getZoomIds = () => zoom.value()

export let addZoomId = (name, room_id) => {
  zoom.insert({ name, room_id }).write()
}

export let removeZoomId = id => {
  zoom.remove({ id }).write()
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Cache
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

let getCache = (key) => {
  let expires = cache.get(`${key}_expires`).value()

  if ( !expires || expires <= Date.now() ) return null

  return cache.get(key).value()
}

let setCache = (key, data) => {
  zoomDb.set(`cache.${key}`, data).write()
  zoomDb.set(`cache.${key}_expires`, (Date.now() + (1000 * 60 * 30))).write()
}//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Requests
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

const config = () => {
  if ( !accessToken.value() ) return

  return { headers: { ...headers, "Authorization": `Bearer ${accessToken.value()}`}}
}

const getRequest = async (url) => {
  if ( !accessToken.value() ) return

  setPlaceholder('Loading')

  let response

  try {
     response = await get(url, config() )
  } catch (error) {
    if ( refreshToken.value() ) {
      await refreshTokens(refreshToken.value(), clientId.value(), clientSecret.value())
    } else {
      await getTokens(clientId.value(), redirectUri)
    }

    if ( accessToken.value() ) {
      response = await get(url, config())
    }
  }

  return response.data || null
}

const getEndpoint = async endpoint => {
  let key  = endpoint.replace(/\.[^/.]+$/, "")
  let data = getCache(key)

  if ( data !== null ) return data

  data = await getRequest(`${apiBase}/${endpoint}`)

  setCache(key, data)

  return data
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Methods
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

export const getProfile = () => getEndpoint('users/me')

export const getMeetings = () => getEndpoint('users/me/meetings')

export const getScheduled = () => getEndpoint('users/me/meetings?type=scheduled')

export const getUpcoming = () => getEndpoint('users/me/meetings?type=upcoming')


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Setup
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

if ( !clientId.value() ) await getClientId()
if ( !clientSecret.value() ) await getClientSecret()
if ( !refreshToken.value() ) await getTokens(clientId.value(), redirectUri)