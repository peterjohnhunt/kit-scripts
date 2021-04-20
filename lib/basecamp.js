let express = await npm('express')
let parseLinkHeader = await npm('parse-link-header')


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Database
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

let basecampDb = db("basecamp", {
  client_id: null,
  client_secret: null,
  access_token: null,
  refresh_token: null,
  profile: null,
  account_id: null,
  cache: {},
})


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Constants
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

const apiBase = 'https://3.basecampapi.com'
const authBase = 'https://launchpad.37signals.com'

const emojiPattern = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/

const clientId     = basecampDb.get('client_id')
const clientSecret = basecampDb.get('client_secret')
const accessToken  = basecampDb.get('access_token')
const refreshToken = basecampDb.get('refresh_token')
const profile      = basecampDb.get('profile')
const accountId    = basecampDb.get('account_id')
const cache        = basecampDb.get('cache')

const redirectUri = encodeURIComponent('http://localhost:3003')

const headers = {
  "User-Agent"   : "ScriptKit (support@usefulgroup.com)",
  "Content-Type" : "application/json; charset=utf-8",
  "Accept"       : "application/json"
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Helpers
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

const getEmoji = (text) => {
  let emoji = text.match(emojiPattern)

  if ( emoji ) return emoji.pop()

  return ''
}

const stripEmoji = (text) => {
  return text.replace(emojiPattern, '')
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Authentication
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

const getClientId = async () => {
  let clientId = await arg('Enter your client id')

  basecampDb.set('client_id', clientId).write()
}

const getClientSecret = async () => {
  let clientSecret = await arg('Enter your client secret')

  basecampDb.set('client_secret', clientSecret).write()
}

const getTokens = async (clientId, redirectUri) => {
  const app = express();
  
  app.get('/', handleRequest)
  
  let server = await app.listen(3003)
  
  exec(`open "${authBase}/authorization/new?type=web_server&client_id=${clientId}&redirect_uri=${redirectUri}"`)

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
  let response = await post(`${authBase}/authorization/token?type=web_server&client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}&code=${authCode}`)
  
  let { access_token, refresh_token } = response.data

  basecampDb.set('access_token', access_token).write()
  basecampDb.set('refresh_token', refresh_token).write()
}

const refreshTokens = async (token, clientId, clientSecret, redirectUri) => {
  let response = await post(`${authBase}/authorization/token?type=refresh&refresh_token=${token}&client_id=${clientId}&redirect_uri=${redirectUri}&client_secret=${clientSecret}`)

  let { access_token } = response.data
  
  basecampDb.set('access_token', access_token).write()
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
  basecampDb.set(`cache.${key}`, data).write()
  basecampDb.set(`cache.${key}_expires`, (Date.now() + (1000 * 60 * 30))).write()
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
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
      await refreshTokens(refreshToken.value(), clientId.value(), clientSecret.value(), redirectUri)
    } else {
      await getTokens(clientId.value(), redirectUri)
    }

    if ( accessToken.value() ) {
      response = await get(url, config())
    }
  }

  if ( !response ) return

  let { link } = response.headers

  if ( link ) {
    let { next } = parseLinkHeader(link)

    let nextPage = await getRequest(next.url);

    return [ ...response.data, ...nextPage ]
  }

  return response.data
}

const postRequest = async (url, data) => {
  if ( !accessToken.value() ) return

  let response = await post(url, data, config())

  if ( !response ) return

  return response.data
}

const filter = (data, filters) => {
  if ( !data ) return data

  if (_.isEmpty(filters)) return data

  return data.filter(item => {
    for(var key in filters) {
      if(!(key in item) || filters[key] !== item[key]) return false;
    }
    return true
  })
}

const getEndpoint = async endpoint => {
  let key  = endpoint.replace(/\.[^/.]+$/, "")
  let data = getCache(key)

  if ( data !== null ) return data

  data = await getRequest(`${apiBase}/${accountId}/${endpoint}`)

  setCache(key, data)

  return data
}

const postEndpoint = (endpoint, data) => postRequest(`${apiBase}/${accountId}/${endpoint}`, data)


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Methods
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

export const getAllProjects = (filters = {}) => getEndpoint('projects.json').then((projects) => filter(projects, filters))

export const getTeams = (filters = {}) => getAllProjects({ ...filters, purpose: 'team'})

export const getProjects = (filters = {}) => getAllProjects({ ...filters, purpose: 'topic'})

export const getBookmarked = (filters = {}) => getAllProjects({ ...filters, bookmarked: true})

export const getProject = (project_id) => getEndpoint(`project/${project_id}.json`)

export const getPeople = (filters = {personable_type: "User"}) => getEndpoint('people.json').then((people) => filter(people, filters))

export const getPerson = (person_id) => getEndpoint(`people/${person_id}.json`)

export const getTodoSet = async (project) => {
  if ( !_.isObject(project) ) project = await getProject(project)

  return project.dock.filter(item => item.name == 'todoset').shift()
}

export const getTodoLists = (project_id, todoset_id, filters = {}) => getEndpoint(`buckets/${project_id}/todosets/${todoset_id}/todolists.json`).then((lists) => filter(lists, filters))

export const getTodoList = (project_id, todoset_id, list_id) => getEndpoint(`buckets/${project_id}/todosets/${todoset_id}/todolists/${list_id}.json`)

export const getTodos = (project_id, list_id) => getEndpoint(`buckets/${project_id}/todolists/${list_id}/todos.json`)

export const createTodo = (data, project_id, list_id) => postEndpoint(`buckets/${project_id}/todolists/${list_id}/todos.json`, data)


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Select
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

export const selectAccount = async () => {
  let response = await get(`${authBase}/authorization.json`, { headers: { ...headers, "Authorization": `Bearer ${accessToken.value()}`} })
  
  let { identity, accounts } = response.data

  let accountId

  if ( accounts.length > 1 ) {
    accountId = await arg(`Select an account for ${identity.email_address}`, accounts.map(account => { return {
      name: account.name,
      value: account.id
    } }))
  } else {
    accountId = accounts.pop().id
  }
  
  basecampDb.set('account_id', accountId).write()

  let profile = await getRequest(`${apiBase}/${accountId}/my/profile.json`)

  basecampDb.set('profile', profile).write()
}

export const selectProject = async () => {
  let projects = await getAllProjects()

  let project = await arg(`Select a project:`, projects?.sort((a, b) => (a.name > b.name) ? 1 : -1).sort((a, b) => {
    if (a.bookmarked === b.bookmarked) {
      return 0
    } else {
      return a.bookmarked ? -1 : 1
    }
  }).map(item => {
    let emoji = getEmoji(item.name)
    let name  = stripEmoji(item.name)
    let html  = `<span class="class="h-12 w-12 flex-none">${name}</span>`

    if (emoji) {
      html += `<span class="class="h-12 w-12 flex-none">${emoji}</span>`
    }

    return {
      name: item.name,
      value: item,
      html: html
    }
  }))

  return project
}

export const selectTodoList = async (project=null) => {
  if (!project) {
    project = await selectProject()
  } else if ( !_.isObject(project) ) {
    project = await getProject(project)
  }

  let todoSet = await getTodoSet(project)

  let lists = await getTodoLists(project.id, todoSet.id)

  let list = await arg(`Select a list:`, lists?.sort((a, b) => (a.title > b.title) ? 1 : -1).map(item => {
    let ratio = item.completed_ratio
    let html = `<span class="class="h-12 w-12 flex-none">${item.title}</span>`

    if (ratio) {
      html += `<span class="class="h-12 w-12 flex-none">${ratio}</span>`
    }

    return {
      name: item.title,
      value: item,
      description: `${item.bucket.name} - ${item.parent.title}`,
      html: html
    }
  }))

  return list
}

export const selectTodo = async (project=null, list=null) => {
  if (!project) {
    project = await selectProject()
  } else if ( !_.isObject(project) ) {
    project = await getProject(project)
  }

  let todoSet = await getTodoSet(project)

  if (!list) {
    list = await selectTodoList(project)
  } else if ( !_.isObject(list) ) {
    list = await getTodoList(project.id, todoSet.id)
  }

  let todos = await getTodos(project.id, list.id)

  let todo = await arg(`Select a todo:`, todos.map(item => { return {
    name: item.title,
    value: item,
    description: `${item.bucket.name} - ${todoSet.title} - ${item.parent.title}`,
  }}))

  return todo
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Setup
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

if ( !clientId.value() ) await getClientId()
if ( !clientSecret.value() ) await getClientSecret()
if ( !refreshToken.value() ) await getTokens(clientId.value(), redirectUri)
if ( !accountId.value() || !profile.value() ) await selectAccount()

export const me = profile.value()