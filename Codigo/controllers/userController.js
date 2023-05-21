const { User } = require('../models/User')
const ServiceRequest = require('../models/ServiceRequest')
const Project = require('../models/Project')
const passport = require('passport')

module.exports = {
    // OK
    async renderLoginForm(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/user/dashboard')
            return
        }    
        
        res.render('login')
    },

    // OK
    async renderDashboard(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        const projects = await Project.find()
        const serviceRequests = await ServiceRequest.find()
    
        const restrictProjects = projects.filter(project => {
            return project.developers.some((dev) => {
                return dev.email === req.user.email
            })
        })
    
        if (req.user.email === 'admin') {
            res.render('dashboard', {user: req.user, projects, requestAlert: serviceRequests.length == 0 ? false : true})
        } else {
            res.render('dashboard', {user: req.user, projects: restrictProjects})
        }
    },

    // OK
    async renderRegisterForm(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        if (req.user.email === 'admin') {
            res.render('user-register')
        }
    },

    // OK
    async sendRegisterForm(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        if (req.user.email === 'admin') {

            const { email, name, role, password } = req.body

            User.register({ email, name, role }, password, (err, newUser) => { if (err) { console.log(err) }})
            
            res.redirect('/user/dashboard')
        }
    },

    // OK
    async renderNotifications(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }

        res.render('notification-viewer', {notifications: req.user.notifications})
    },

    // OK
    async dismissNotification(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }

        const { notificationId } = req.body

        await User.updateOne({_id: req.user.id}, {$pull:
            {
                notifications: {_id: notificationId}
            }
        })

        res.redirect('/user/notification')
    },
    
    // OK
    async auth(req, res) {

        const { email, password } = req.body

        const user = new User({email, password})

        passport.authenticate('local')(req, res, () => {
            req.login(user, (err) => {})
            res.redirect('/user/dashboard')
        })
    },

    // OK
    async logout(req, res) {
        if (req.isAuthenticated()) {
            req.logout((err) => {})
        }
        
        res.redirect('/user/login')
    }
}