// Menu: Basecamp | Create Task
// Description: Create a Basecamp task

let { getDate } = await lib("helpers")
let { notify } = await kit("desktop")
let { me, selectTodoList, createTodo } = await lib("basecamp")

let list = await selectTodoList()

let title = await arg('Task name:')

let task = await createTodo({
  content: title,
  assignee_ids: [me.id],
  due_on: getDate()
}, list.bucket.id, list.id)

notify("Basecamp", `Task: ${title} Created!`)