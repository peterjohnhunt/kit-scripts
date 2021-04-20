let projectsDb = db("projects", { projects: [] })
export let projects = projectsDb.get("projects")

export let getProjects = () => projects.value()

export let getProject = (id) => projects.find({id}).value()

export let addProject = fullpath => {
  projects.insert({ fullpath }).write()
}

export let removeProject = id => {
  projects.remove({ id }).write()
}

export let getProjectChoices = () =>
  getProjects().map((project) => ({
    name: path.basename(project.fullpath),
    value: project,
  }))