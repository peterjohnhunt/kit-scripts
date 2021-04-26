// Menu: Basecamp | Message
// Description: Message Commands

let { scriptChoices } = await lib("helpers")
let { me } = await lib("basecamp")

scriptChoices([{
  name: 'Create Message',
  value: 'basecamp-create-message'
},{
  name: 'View Message',
  value: 'basecamp-view-message'
}], `Hello ${me.name}:`)