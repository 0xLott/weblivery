const ServiceRequest = require('../models/ServiceRequest')
const { User } = require('../models/User')
const Project = require('../models/Project')

module.exports = {
    async renderForm(req, res) {
        res.render('service-form')
    },

    async sendForm(req, res) {
        const newServiceRequest = new ServiceRequest({
            requesterFullname: req.body.fullname,
            requestTitle: req.body.title,
            requestDescription: req.body.description,
            email: req.body.email,
            phone: req.body.phone,
            whatsapp: req.body.whatsapp
        })

        newServiceRequest.save()
    },

    async acceptRequest(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        await ServiceRequest.findByIdAndRemove(req.body.id)
    
        const newProject = new Project({
            clientName: req.body.clientName,
            clientEmail: req.body.clientEmail,
            clientPhone: req.body.clientPhone,
            projectName: req.body.projectName,
            projectDescription: req.body.projectDescription,
            projectOwner: req.user.name,
            projectDeadline: req.body.projectDeadline,
            projectStatus: 0,
        })
    
        const assignedDevelopers = req.body.assignedDevelopers
    
        Promise.all(assignedDevelopers.map(async (developerId) => {
            let foundDeveloper = await User.findById(developerId)
    
            newProject.developers.push(foundDeveloper)

        })).then(() => { newProject.save() })
    
        res.redirect('/user/dashboard')
    },

    async declineRequest(req, res) {
        const requestId = req.body.decline

        await ServiceRequest.findByIdAndRemove(requestId)
    
        res.redirect('/request/view')
    },

    async viewForms(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        if (req.user.email === 'admin') {
        
            const allServiceRequests = await ServiceRequest.find()
    
            const allDevelopers = await User.find()
    
            res.render('service-viewer', {requests: allServiceRequests, developers: allDevelopers})
        }
    }
}