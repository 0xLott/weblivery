const { User } = require('../models/User')
const Project = require('../models/Project')
const passport = require('passport')

module.exports = {
    async renderLoginForm(req, res) {
        if (req.isAuthenticated()) {
            res.redirect('/user/dashboard')
            return
        }    
        
        res.render('login')
    },

    async renderDashboard(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        const allProjects = await Project.find()
    
        let restrictProjects = allProjects.filter(project => {
            return project.developers.some((dev) => {
                return dev.email === req.user.email
            })
        })
    
        if (req.user.email === 'admin') {
            res.render('dashboard', {user: req.user, projects: allProjects})
        } else {
            res.render('dashboard', {user: req.user, projects: restrictProjects})
        }
    },

    async renderRegisterForm(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        if (req.user.email === 'admin') {
            res.render('user-register')
        }
    },

    async sendRegisterForm(req, res) {
        if (!req.isAuthenticated()) {
            res.redirect('/user/login')
            return;
        }
    
        if (req.user.email === 'admin') {
            User.register({
                email: req.body.email,
                name: req.body.fullname,
                role: req.body.role,
                nickname: req.body.nickname
    
            }, req.body.password, (err, newUser) => { if (err) { console.log(err) }})
            res.redirect('/user/dashboard')
        }
    },
    
    async auth(req, res) {

        let { email, password } = req.body

        let user = new User({email: email, password: password })

        passport.authenticate('local')(req, res, () => {
                req.login(user, (err) => {})
                res.redirect('/user/dashboard')
        })
    },

    async logout(req, res) {
        if (req.isAuthenticated()) {
            req.logout((err) => {})
        }
        
        res.redirect('/user/login')
    }
}