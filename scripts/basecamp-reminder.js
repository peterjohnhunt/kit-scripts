// Menu: Basecamp | Create Reminder
// Description: Create a Basecamp reminder

let { getDate } = await lib("helpers")
let { notify } = await kit("desktop")
let {getEmoji, stripEmoji} = await lib('helpers')
let { me, getOrderedProjects, getTodoSet, getTodoLists, createTodo } = await lib("basecamp")

let projects = await getOrderedProjects()

let BASECAMP_REMINDERS_PROJECT_ID = await env("BASECAMP_REMINDERS_PROJECT_ID", { choices: projects?.map(item => {
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

let todoSet = await getTodoSet(BASECAMP_REMINDERS_PROJECT_ID)

let lists = await getTodoLists(BASECAMP_REMINDERS_PROJECT_ID, todoSet.id)

let BASECAMP_REMINDERS_LIST_ID = await env('BASECAMP_REMINDERS_LIST_ID', { choices: lists?.sort((a, b) => (a.title > b.title) ? 1 : -1).map(item => {
  let ratio = item.completed_ratio
  let html = `<span class="class="h-12 w-12 flex-none">${item.title}</span>`

  if (ratio) {
    html += `<span class="class="h-12 w-12 flex-none">${ratio}</span>`
  }

  return {
    name: item.title,
    value: item.id.toString(),
    description: `${item.bucket.name} - ${item.parent.title}`,
    html: html
  }
}) })

let title = await arg('Reminder:')

let task = await createTodo({
  content: title,
  // description: description,
  assignee_ids: [me.id],
  due_on: getDate()
}, BASECAMP_REMINDERS_PROJECT_ID, BASECAMP_REMINDERS_LIST_ID)

notify("Basecamp", `Reminder Created!`)