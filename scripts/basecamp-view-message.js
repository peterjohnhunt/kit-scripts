// Menu: Basecamp | View Message
// Description: View a Basecamp message
// Exclude: true

let { selectMessage, getComments } = await lib("basecamp")

let message = await selectMessage()

let comments = await getComments(message.bucket.id, message.id)

await arg(message.title, comments.map(comment => { return { 
  name: comment.creator.name,
  value: comment,
  description: comment.created_at,
  preview: comment.content
} }))