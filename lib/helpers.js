//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Emojis
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
export const emojiPattern = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])/

export const getEmoji = (text) => {
  let emoji = text.match(emojiPattern)

  if ( emoji ) return emoji.pop()

  return ''
}

export const stripEmoji = (text) => {
  return text.replace(emojiPattern, '')
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ Dates
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
export const getDate = (timestamp=false) => {
  let date  = timestamp ? new Date(timestamp) : new Date()
  let dd    = String(date.getDate()).padStart(2, '0')
  let mm    = String(date.getMonth() + 1).padStart(2, '0')
  let yyyy  = date.getFullYear()

  return `${yyyy}-${mm}-${dd}`
}

export const getTime = (timestamp=null) => {
  let date    = new Date(timestamp)
  let hours   = date.getHours()
  let minutes = date.getMinutes()
  let ampm    = hours >= 12 ? 'pm' : 'am'

  return `${hours}:${minutes}${ampm}`
}


//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
// ✅ ScriptKit
//≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
export const scriptChoices = async (options, placeholder = 'Select a script') => {
  let script = await arg(placeholder, options)
  
  await run(script)
}