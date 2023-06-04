const Project = require('../models/Project')
const { User } = require('../models/User')
const { ToDoItem } = require('../models/ToDoItem')
const { Notification } = require('../models/Notification')
const ServiceRequest = require('../models/ServiceRequest')

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

        const serviceRequests = await ServiceRequest.find()
    
        res.render('project-viewer', {user: req.user, project, developers, user: req.user, requestAlert: serviceRequests.length == 0 ? false : true})
    },

    // OK
    async renderMetrics(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return
        }

        const { projectId } = req.params

        const project = await Project.findById(projectId)

        const serviceRequests = await ServiceRequest.find()

        res.render('metrics', {project, user: req.user, requestAlert: serviceRequests.length == 0 ? false : true})
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

        const newNotification = new Notification({
            title: `Nova Atribuição`,
            message: `Você foi atribuido uma nova atividade "${title}" no projeto: ${project.projectName}`
        })
    
        project.todolist.push(newTodoItem)

        developer.notifications.push(newNotification)
    
        project.save()

        developer.save()
    
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
        var oldDevelopers = []

        project.developers.forEach((oldDev) => {
            oldDevelopers.push(oldDev)
        })

        if (button == 'update') {

            if (status == null || status == "") {
                status = actualStatus
            }

            var projectDevelopers = []

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

                var diff = []

                // notify removed devs
                oldDevelopers.forEach(async (dev) => {
                    let found = projectDevelopers.some((devs) => {
                        if (devs.id === dev.id) {
                            return true;
                        }

                        return false;
                    })

                    if (found == false) {
                        // console.log(dev.id);
                        // diff.push(dev.id)

                        const newNotification = new Notification({
                            title: `Removido`,
                            message: `Você foi removido do projeto: ${project.projectName}`
                        })

                        let removedDev = await User.findById(dev.id)

                        removedDev.notifications.push(newNotification)
                    
                        removedDev.save()
                    }
                })

                //notify new devs
                projectDevelopers.forEach(async (dev) => {
                    let found = oldDevelopers.some((devs) => {
                        if (devs.id === dev.id) {
                            return true
                        }

                        return false
                    })

                    if (found == false) {
                        const newNotification = new Notification({
                            title: `Adicionado`,
                            message: `Você foi adicionado ao projeto: ${project.projectName}`
                        })

                        let addedDev = await User.findById(dev.id)

                        addedDev.notifications.push(newNotification)
                    
                        addedDev.save()
                    }
                })

                res.redirect('/project/' + projectId)
            })

        } else {
            oldDevelopers.forEach(async (dev) => {
                const newNotification = new Notification({
                    title: `Apagado`,
                    message: `O projeto "${project.projectName}" em que você estava foi apagado`
                })

                let workingDev = await User.findById(dev.id)

                workingDev.notifications.push(newNotification)
            
                workingDev.save()
            })

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

        var project = await Project.findById(projectId)
    
        if (button == 'update') {

            // Se o desenvolvedor for atualizado tambem
            if (developerId != "" && developerId != null) {

                const removeNotification = new Notification({
                    title: `Tarefa Removida`,
                    message: `Você foi desatribuido da tarefa "${actualTitle}" no projeto "${project.projectName}"`
                 })
    
                developer.notifications.push(removeNotification)
    
                developer.save()

                developer = await User.findById(developerId)

                const newNotification = new Notification({
                    title: `Nova Atribuição`,
                    message: `Você foi atribuido uma nova atividade no projeto "${project.projectName}"`
                 })
    
                developer.notifications.push(newNotification)
    
                developer.save()
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

            const deleteNotification = new Notification({
                title: `Tarefa Apagada`,
                message: `Sua tarefa "${actualTitle}" no projeto "${project.projectName}" foi apagada`
             })

            developer.notifications.push(deleteNotification)

            developer.save()
        }
    
        res.redirect('/project/' + projectId)
    }
}