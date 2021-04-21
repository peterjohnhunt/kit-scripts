// Menu: Basecamp | Create Message
// Description: Create a Basecamp message

let { notify } = await kit("desktop")
let { selectProject, getMessageBoard, createMessage } = await lib("basecamp")

let project = await selectProject()

let board = await getMessageBoard(project)

let title = await arg('Message name:')

let message = await createMessage({
  subject: title,
  content: 'test',
  status: 'active'
}, project.id, board.id)

notify("Basecamp", `Message: ${title} Created!`)