const Project = require('../models/Project')
const { User } = require('../models/User')
const { ToDoItem } = require('../models/ToDoItem')

module.exports = {

    // OK
    async renderProject(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }

        const { projectId } = req.params
        
        const project = await Project.findById(projectId)

        const developers = await User.find()
    
        res.render('project-viewer', {user: req.user, project, developers})
    },

    // OK
    async renderMetrics(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return
        }

        const { projectId } = req.params

        const project = await Project.findById(projectId)

        res.render('metrics', {project})
    },

    //OK
    async createTodolistItem(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        const { projectId } = req.params
        const { assignedDeveloper, title } = req.body
    
        const project = await Project.findById(projectId)
        const developer = await User.findById(assignedDeveloper)
    
        const newTodoItem = new ToDoItem({
            title,
            developer,
            status: 0
        })
    
        project.todolist.push(newTodoItem)
    
        project.save()
    
        res.redirect('/project/' + projectId)
    },

    // OK
    async editProjectDetails(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return
        }

        const { projectId } = req.params
        const { projectName, deadline, assignedDevelopers, clientName, actualStatus, button } = req.body
        var   { status } = req.body

        const project = await Project.findById(projectId)

        if (button == 'update') {

            if (status == null || status == "") {
                status = actualStatus
            }

            let projectDevelopers = []

            Promise.all(assignedDevelopers.map(async (developerId) => {

                let developer = await User.findById(developerId)
                projectDevelopers.push(developer)

            })).then(() => {

                project.projectName = projectName
                project.clientName = clientName
                project.developers = projectDevelopers
                project.status = status
                project.deadline = deadline
                project.save()

                res.redirect('/project/' + projectId)
            })

        } else {
            await Project.findByIdAndRemove(projectId)

            res.redirect('/user/dashboard')
        }
    },

    // OK
    async editTodolistItem(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }

        const { projectId, taskId } = req.params
        const { title, status, developerId, button, actualStatus, actualTitle, actualDeveloperId } = req.body
    
        var developer = await User.findById(actualDeveloperId)
    
        if (button == 'update') {

            if (developerId != "" && developerId != null) {
                developer = await User.findById(developerId)
            }

            await Project.findOneAndUpdate({'todolist._id': taskId}, {$set:
                {
                    'todolist.$.title': title == null ? actualTitle : title,
                    'todolist.$.status': status == "" ? actualStatus : status,
                    'todolist.$.developer': developer
                }
            })
    
        } else if (button == 'remove') {

            await Project.updateOne({_id: projectId}, {$pull:
                {
                    todolist: {_id: taskId}
                }
            }, {safe: true})
        }
    
        res.redirect('/project/' + projectId)
    }
}