// Menu: Manage Projects
// Exclude: true

let {
  addProject,
  removeProject,
  getProjects
} = await lib("projects")

const base = '~/Development/Sites'

let list = async () => {
  let choices = getProjects().map(project => { return {
    name: path.basename(project.fullpath),
    value: project.id
  } } )

  await arg('Select project', choices)

  await list()
}

let add = async () => {
  let choices = await ls(base)

  choices = choices.map(dir => { return {
    name: dir,
    value: path.join(base, dir)
  } } )

  addProject(await arg("Enter project path:", choices))

  await add()
}

let remove = async () => {
  let choices = getProjects().map(project => { return {
    name: path.basename(project.fullpath),
    value: project.id
  } } )

  removeProject(await arg("select project:", choices))

  await remove()
}

onTab("List", list)
onTab("Add", add)
onTab("Remove", remove)