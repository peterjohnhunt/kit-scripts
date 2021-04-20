// Menu: Basecamp | Create Task
// Description: Create a Basecamp task

let { getDate } = await lib("helpers")
let { me, selectTodoList, createTodo } = await lib("basecamp")

let list = await selectTodoList()

setHint(`${list.bucket.name} - ${list.title}`)

let title = await arg('Task name:')

let response = await createTodo({
  content: title,
  assignee_ids: [me.id],
  due_on: getDate()
}, list.bucket.id, list.id)

setHint(`Task: ${title} Created!`)

wait(2000)