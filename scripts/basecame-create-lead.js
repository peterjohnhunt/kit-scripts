// Menu: Basecamp | Create Lead
// Description: Create a Basecamp lead

let { notify } = await kit("desktop")
let {getEmoji, stripEmoji} = await lib('helpers')
let { getOrderedProjects, getMessageBoard, getMessages, createComment } = await lib("basecamp")

let projects = await getOrderedProjects()

let BASECAMP_LEADS_PROJECT_ID = await env("BASECAMP_LEADS_PROJECT_ID", { choices: projects?.map(item => {
  let emoji = getEmoji(item.name)
  let name  = stripEmoji(item.name)
  let html  = `<span class="class="h-12 w-12 flex-none">${name}</span>`

  if (emoji) {
    html += `<span class="class="h-12 w-12 flex-none">${emoji}</span>`
  }

  return {
    name: item.name,
    value: item.id.toString(),
    html: html
  }
}) })

let messageBoard = await getMessageBoard(BASECAMP_LEADS_PROJECT_ID.toString())

let messages = await getMessages(BASECAMP_LEADS_PROJECT_ID, messageBoard.id)

let BASECAMP_LEADS_MESSAGE_ID = await env("BASECAMP_LEADS_MESSAGE_ID", { choices: messages?.sort((a, b) => (a.title > b.title) ? 1 : -1).map(item => {
  let comments = item.comments_count
  let html = `<span class="class="h-12 w-12 flex-none">${item.title}</span>`

  if (comments) {
    html += `<span class="class="h-12 w-12 flex-none">${comments}</span>`
  }

  return {
    name: item.title,
    value: item.id.toString(),
    description: `${item.bucket.name} - ${item.parent.title}`,
    html: html
  }
}) })

let pieces  = ['Client', 'Contact', 'Project', 'Timeline', 'Budget', 'Status', 'Notes']
let content = []

for (let index = 0; index < pieces.length; index++) {
  let title = pieces[index];
  let value = await arg(`${title}:`)

  if (value) content.push(`<strong>${title}:</strong> ${value}`)
}

let comment = createComment({ content: `<div>${content.join('<br>')}</div>` }, BASECAMP_LEADS_PROJECT_ID, BASECAMP_LEADS_MESSAGE_ID)

notify("Basecamp", `Lead Created!`)