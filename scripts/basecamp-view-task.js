// Menu: Basecamp | View Task
// Description: View a Basecamp task
// Exclude: true

let { selectTodo } = await lib("basecamp")

let todo = await selectTodo()

setHint(`${todo.bucket.name} - ${todo.parent.title}`)

await arg(todo.title, todo.description)