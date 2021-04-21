// Menu: Basecamp
// Description: Command Menu
// Shortcut: shift alt b

let { me } = await lib("basecamp")

let tab = async (options) => {
  let script = await arg(`Hello ${me.name}:`, options)
  
  await run(script)
}

onTab('Shortcuts', () => tab([{
  name: 'Create Lead',
  value: 'basecame-create-lead'
}]))

onTab('Basic', () => tab([{
  name: 'Create Task',
  value: 'basecamp-create-task'
},{
  name: 'View Task',
  value: 'basecamp-view-task'
},{
  name: 'Create Message',
  value: 'basecamp-create-message'
},{
  name: 'View Message',
  value: 'basecamp-view-message'
}]))