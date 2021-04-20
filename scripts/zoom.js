// Menu: Zoom Quick Links
// Description: Open Zoom Room
// Shortcut: shift alt z

let {
  addZoomId,
  removeZoomId,
  getZoomIds,
  getScheduled,
  getUpcoming,
  getMeetings
} = await lib("zoom")
let { getDate, getTime } = await lib("helpers")

let personal = async () => {
  let choices = getZoomIds()
  let zoom_id = await arg('Select Zoom Room', choices.map(item => {
    return { name: item.name, value: item.room_id }
  }))

  exec(`open zoommtg://zoom.us/join?confno=${zoom_id}`)
  copy(`https://us02web.zoom.us/j/${zoom_id}`)
  await personal()
}

let today = async () => {
  let choices = await getUpcoming()
  let zoom_id = await arg('Select Meeting', choices.meetings.filter(meeting => {
    if ( meeting.type != 2 ) return

    if ( !meeting.start_time ) return

    return getDate() == getDate(meeting.start_time)
  }).map(item => {
    return { name: item.topic, value: item.id, description: getTime(item.start_time) }
  }))

  exec(`open zoommtg://zoom.us/join?confno=${zoom_id}`)
  copy(`https://us02web.zoom.us/j/${zoom_id}`)
  await today()
}

let recurring = async () => {
  let choices = await getUpcoming()
  let zoom_id = await arg('Select Meeting', choices.meetings.filter(meeting => meeting.type == 3).map(item => {
    return { name: item.topic, value: item.id }
  }))

  exec(`open zoommtg://zoom.us/join?confno=${zoom_id}`)
  copy(`https://us02web.zoom.us/j/${zoom_id}`)
  await recurring()
}

let meetings = async () => {
  let choices = await getMeetings()
  let zoom_id = await arg('Select Meeting', choices.meetings.filter(meeting => meeting.type == 3).map(item => {
    return { name: item.topic, value: item.id }
  }))

  exec(`open zoommtg://zoom.us/join?confno=${zoom_id}`)
  copy(`https://us02web.zoom.us/j/${zoom_id}`)
  await meetings()
}

let add = async () => {
  let name    = await arg("Enter name:")
  let room_id = await arg("Enter zoom number:")
  addZoomId(name, room_id)
  await run('zoom', '--tab', 'Personal')
}

let remove = async () => {
  let id = await arg("Remove:", getZoomIds().map(item => {
    return { name: item.name, value: item.id }
  }))
  removeZoomId(id)
  await run('zoom', '--tab', 'Personal')
}

onTab("Personal", personal)
onTab("Today", today)
onTab("Recurring", recurring)
onTab("Meetings", meetings)
onTab("Add", add)
onTab("Remove", remove)