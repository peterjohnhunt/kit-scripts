// Menu: Basecamp
// Description: Command Menu
// Shortcut: shift alt b

let { me } = await lib("basecamp")

let script = await arg(`Hello ${me.name}:`, [{
  name: 'Create Task',
  value: 'basecamp-create-task'
},{
  name: 'View Task',
  value: 'basecamp-view-task'
}])

await run(script)