const Project = require('../models/Project')
const { User } = require('../models/User')
const { ToDoItem } = require('../models/ToDoItem')

module.exports = {
    async renderProject(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        let project = await Project.findById(req.params.projectId)

        const allDevelopers = await User.find()
    
        res.render('project-viewer', {user: req.user, project: project, developers: allDevelopers})
    },

    async renderMetrics(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return
        }

        let project = await Project.findById(req.params.projectId)

        res.render('metrics', {project: project})
    },

    async createTodolistItem(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        const projectId = req.params.projectId
    
        let assignedDeveloper = await User.findById(req.body.assignedDeveloper)
    
        let project = await Project.findById(projectId)
    
        const newTodoItem = new ToDoItem({
            title: req.body.taskInput,
            developer: assignedDeveloper,
            status: 0
        })
    
        project.todolist.push(newTodoItem)
    
        project.save()
    
        res.redirect('/project/' + projectId)
    },

    async editProjectDetails(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return
        }

        const projectId = req.params.projectId
        const projectName = req.body.projectName
        const clientName = req.body.clientName
        var projectStatus = req.body.projectStatus
        const projectDeadline = req.body.projectDeadline
        const assignedDevelopers = req.body.assignedDevelopers

        const project = await Project.findById(projectId)

        if (req.body.button == 'update') {

            let developers = []

            if (projectStatus == null || projectStatus == "") {
                projectStatus = req.body.actualStatus
            }

            Promise.all(assignedDevelopers.map(async (developerId) => {

                let foundDeveloper = await User.findById(developerId)
        
                developers.push(foundDeveloper)

            })).then(() => {

                project.projectName = projectName
                project.clientName = clientName
                project.projectStatus = projectStatus
                project.projectDeadline = projectDeadline
                project.developers = developers

                project.save()

                res.redirect('/project/' + projectId)
            })

        } else { 
            await Project.findByIdAndRemove(projectId)

            res.redirect('/user/dashboard')
        }
    },

    async editTodolistItem(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        const projectId = req.params.projectId
        const taskId = req.params.taskId
    
        let taskName = req.body.taskName
        let taskDeveloper = req.body.taskDeveloper
        let taskStatus = req.body.taskStatus

        let actualDeveloper = await User.findById(req.body.actualDeveloper)
        let actualStatus = req.body.actualStatus
        let actualName = req.body.actualName
    
        if (req.body.button == 'update') {

            if (taskDeveloper == null || taskDeveloper == "") {
                taskDeveloper = actualDeveloper
            } else {
                taskDeveloper = await User.findById(taskDeveloper)
            }
    
            await Project.findOneAndUpdate({'todolist._id': taskId}, {$set:
            {
                'todolist.$.title': taskName == null ? actualName : taskName,
                'todolist.$.status': taskStatus == "" ? actualStatus : taskStatus,
                'todolist.$.developer': taskDeveloper
            }})
    
        } else {
            await Project.updateOne({_id: projectId}, {
                $pull: {
                    todolist: {_id: taskId}
                }
            }, {safe: true})
        }
    
        res.redirect('/project/' + projectId)
    }
}