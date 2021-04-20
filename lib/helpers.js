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