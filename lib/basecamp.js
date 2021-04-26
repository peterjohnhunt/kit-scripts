let express = await npm('express')
let parseLinkHeader = await npm('parse-link-header')
let {getEmoji, stripEmoji} = await lib('helpers')

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

const accessToken  = basecampDb.get('access_token')
const refreshToken = basecampDb.get('refresh_token')
const profile      = basecampDb.get('profile')
const accountId    = basecampDb.get('account_id')
const cache        = basecampDb.get('cache')

const redirectUri = encodeURIComponent('http://localhost:3003')

//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Authentication
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

const envOptions = {
  hint: md(`You need to [create an app](https://launchpad.37signals.com/integrations) to get these keys`),
  ignoreBlur: true,
  secret: true
}

const getClientId = async () => {
  return await env('BASECAMP_CLIENT_ID', envOptions)
}

const getClientSecret = async () => {
  return await env('BASECAMP_CLIENT_SECRET', envOptions)
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

  let clientId     = await getClientId()
  let clientSecret = await getClientSecret()

  if ( code ) await getAccessToken(code, clientId, clientSecret, redirectUri)
  
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
  let headers = {
    "User-Agent"   : "ScriptKit (support@usefulgroup.com)",
    "Content-Type" : "application/json; charset=utf-8",
    "Accept"       : "application/json"
  }

  if ( accessToken.value() ) headers["Authorization"] = `Bearer ${accessToken.value()}`

  return { headers }
}

const getRequest = async (url) => {
  if ( !accessToken.value() ) return

  setPlaceholder('Loading')

  let response

  try {
     response = await get(url, config() )
  } catch (error) {
    let clientId     = await getClientId()
    let clientSecret = await getClientSecret()

    if ( refreshToken.value() ) {
      await refreshTokens(refreshToken.value(), clientId, clientSecret, redirectUri)
    } else {
      await getTokens(clientId, redirectUri)
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

const sort = (data) => {
  if ( !data ) return data

  return data.sort((a, b) => (a.name > b.name) ? 1 : -1).sort((a, b) => {
    if (a.bookmarked === b.bookmarked) {
      return 0
    } else {
      return a.bookmarked ? -1 : 1
    }
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

const getDockItem = async (type, project) => {
  if ( !_.isObject(project) ) project = await getProject(project)
  return project.dock.filter(item => item.name == type).shift()
}

//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Methods
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

export const getAllProjects = (filters = {}) => getEndpoint('projects.json').then((projects) => filter(projects, filters))

export const getOrderedProjects = (filters = {}) => getAllProjects(filters).then((projects) => sort(projects))

export const getTeams = (filters = {}) => getAllProjects({ ...filters, purpose: 'team'})

export const getProjects = (filters = {}) => getAllProjects({ ...filters, purpose: 'topic'})

export const getBookmarked = (filters = {}) => getAllProjects({ ...filters, bookmarked: true})

export const getProject = (project_id) => getEndpoint(`projects/${project_id}.json`)

export const getPeople = (filters = {personable_type: "User"}) => getEndpoint('people.json').then((people) => filter(people, filters))

export const getPerson = (person_id) => getEndpoint(`people/${person_id}.json`)

export const getTodoSet = async (project) => getDockItem('todoset', project)

export const getTodoLists = (project_id, todoset_id, filters = {}) => getEndpoint(`buckets/${project_id}/todosets/${todoset_id}/todolists.json`).then((lists) => filter(lists, filters))

export const getTodoList = (project_id, todoset_id, list_id) => getEndpoint(`buckets/${project_id}/todosets/${todoset_id}/todolists/${list_id}.json`)

export const getTodoListGroups = (project_id, list_id) => getEndpoint(`buckets/${project_id}/todolists/${list_id}/groups.json`)

export const getTodoListGroup = (project_id, group_id) => getEndpoint(`buckets/${project_id}/todolists/${group_id}.json`)

export const getTodos = (project_id, list_id) => getEndpoint(`buckets/${project_id}/todolists/${list_id}/todos.json`)

export const createTodo = (data, project_id, list_id) => postEndpoint(`buckets/${project_id}/todolists/${list_id}/todos.json`, data)

export const getMessageBoard = async (project) => getDockItem('message_board', project)

export const getMessages = (project_id, messageboard_id) => getEndpoint(`buckets/${project_id}/message_boards/${messageboard_id}/messages.json`)

export const createMessage = (data, project_id, messageboard_id) => postEndpoint(`buckets/${project_id}/message_boards/${messageboard_id}/messages.json`, data)

export const getComments = (project_id, item_id) => getEndpoint(`buckets/${project_id}/recordings/${item_id}/comments.json`)

export const createComment = (data, project_id, item_id) => postEndpoint(`buckets/${project_id}/recordings/${item_id}/comments.json`, data)

export const getVault = async (project) => getDockItem('vault', project)

export const getFolders = (project_id, vault_id) => getEndpoint(`buckets/${project_id}/vaults/${vault_id}/vaults.json`)

export const getFiles = (project_id, vault_id) => getEndpoint(`buckets/${project_id}/vaults/${vault_id}/uploads.json`)


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Select
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

export const selectAccount = async () => {
  let response = await get(`${authBase}/authorization.json`, config())
  
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
  let projects = await getOrderedProjects()

  let project = await arg(`Select a project:`, projects?.map(item => {
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

export const selectMessage = async (project=null) => {
  if (!project) {
    project = await selectProject()
  } else if ( !_.isObject(project) ) {
    project = await getProject(project)
  }

  let messageBoard = await getMessageBoard(project)

  let messages = await getMessages(project.id, messageBoard.id)

  let message = await arg(`Select a message:`, messages?.sort((a, b) => (a.title > b.title) ? 1 : -1).map(item => {
    let comments = item.comments_count
    let html = `<span class="class="h-12 w-12 flex-none">${item.title}</span>`

    if (comments) {
      html += `<span class="class="h-12 w-12 flex-none">${comments}</span>`
    }

    return {
      name: item.title,
      value: item,
      description: `${item.bucket.name} - ${item.parent.title}`,
      html: html
    }
  }))

  return message
}

//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Setup
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡

if ( !refreshToken.value() ) await getTokens(await getClientId(), redirectUri)
if ( !accountId.value() || !profile.value() ) await selectAccount()

export const me = profile.value()