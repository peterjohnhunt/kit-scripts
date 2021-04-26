// Menu: Basecamp
// Description: Command Menu
// Shortcut: shift alt b

let { scriptChoices } = await lib("helpers")
let { me } = await lib("basecamp")

let placeholder = `Hello ${me.name}:`

onTab('Shortcuts', () => scriptChoices([{
  name: 'Create Lead',
  value: 'basecame-create-lead'
},{
  name: 'Create Reminder',
  value: 'basecame-create-reminder'
}], placeholder))

onTab('Tasks', () => scriptChoices([{
  name: 'Create Task',
  value: 'basecamp-create-task'
},{
  name: 'View Task',
  value: 'basecamp-view-task'
}], placeholder))

onTab('Messages', () => scriptChoices([{
  name: 'Create Message',
  value: 'basecamp-create-message'
},{
  name: 'View Message',
  value: 'basecamp-view-message'
}], placeholder))