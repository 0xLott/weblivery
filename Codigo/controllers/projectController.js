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
    
        res.render('project-viewer', {project: project})
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

    async editTodolistItem(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        const projectId = req.params.projectId
        const taskId = req.params.taskId
    
        const taskName = req.body.taskName
        const actualDeveloper = await User.findById(req.body.actualDeveloper)
    
        let taskDeveloper = req.body.taskDeveloper
    
        if (req.body.button == 'update') {
    
            if (taskDeveloper != "") {
                taskDeveloper = await User.findById(req.body.taskDeveloper)
            }
    
            await Project.findOneAndUpdate({'todolist._id': taskId}, {$set:
            {
                'todolist.$.title': taskName,
                'todolist.$.status': req.body.taskStatus == "" ? req.body.actualStatus : req.body.taskStatus,
                'todolist.$.developer': taskDeveloper == "" ? actualDeveloper : taskDeveloper
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