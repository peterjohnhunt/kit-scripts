// Menu: Basecamp | Task
// Description: Task Commands

let { scriptChoices } = await lib("helpers")
let { me } = await lib("basecamp")

scriptChoices([{
  name: 'Create Task',
  value: 'basecamp-create-task'
},{
  name: 'View Task',
  value: 'basecamp-view-task'
}], `Hello ${me.name}:`)