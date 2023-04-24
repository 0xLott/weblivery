require('dotenv').config()

const express = require("express") 
const session = require('express-session')

const mongoose = require('mongoose').set('strictQuery', true)
const bodyParser = require("body-parser") 
const ejs = require('ejs') 

const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()

app.set('view engine', 'ejs') 
app.use(express.static(__dirname + '/public')) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: true })) 
app.use(passport.initialize()) 
app.use(passport.session()) 

mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@db-cluster.cjjdosp.mongodb.net/weblivery')

const serviceRequestSchema = new mongoose.Schema({
    requesterFullname: String,
    requestTitle: String,
    requestDescription: String,
    email: String,
    whatsapp: String,
    phone: Number
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    nickname: String,
    name: String,
    role: String
})

const todoItemSchema = new mongoose.Schema({
    title: String,
    status: Number,
    developer: userSchema
})

const projectSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    clientPhone: Number,
    projectName: String,
    projectDescription: String,
    projectOwner: String,
    projectStatus: String,
    projectDeadline: String,
    todolist: [todoItemSchema],
    developers: [userSchema]
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})

const User = new mongoose.model("User", userSchema)

const Project = new mongoose.model("Project", projectSchema)

const ToDoItem = new mongoose.model("ToDoItem", todoItemSchema)

const ServiceRequest = new mongoose.model("ServiceRequest", serviceRequestSchema)

passport.use(User.createStrategy()) 
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

User.register({email: 'admin', name: 'Guilherme Gentili', nickname: 'Ademiro', role: 'Administrador'}, 'admin', (err, newUser) => {
    if (err) {
        console.log('Admin user already exists');
        return
    }
       
    console.log('Admin user created');
})

/* Login Page */

app.get('/login', (req, res) => {
    if (req.isAuthenticated()) {
        res.render('dashboard')
        return
    }

    res.render('login')
})

app.post('/login', (req, res) => {
    let user = new User({email: req.body.email, password: req.body.password })

    passport.authenticate('local')(req, res, () => {
        req.login(user, (err) => {})
        res.redirect('/dashboard')
    })
})

/* Logout */

app.get('/logout', (req, res) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {})
        res.redirect('/login')
    }
})

/* Service Request Form */

app.get('/', (req, res) => {
    res.render('service-form')
})

app.post('/', (req, res) => {

    const newServiceRequest = new ServiceRequest({
        requesterFullname: req.body.fullname,
        requestTitle: req.body.title,
        requestDescription: req.body.description,
        email: req.body.email,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp
    })

    newServiceRequest.save()

    // TODO: Renderizar uma tela de sucesso
})

/* Dashboard */

app.get('/dashboard', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
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
})

app.get('/dashboard/:projectId', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return;
    }

    let project = await Project.findById(req.params.projectId)

    res.render('project-viewer', {project: project})
})

/* TodoList */

app.post('/dashboard/:projectId/todolist/new', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
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

    res.redirect('/dashboard/' + project.id)
})

app.post('/dashboard/:projectId/todolist/:taskId/edit', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
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

    res.redirect('/dashboard/' + projectId)
})

/* Admin Routes */

app.get('/admin/requests', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return;
    }

    if (req.user.email === 'admin') {
    
        const allServiceRequests = await ServiceRequest.find()

        const allDevelopers = await User.find()

        res.render('service-viewer', {requests: allServiceRequests, developers: allDevelopers})
    }
})

app.get('/admin/register', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return;
    }

    if (req.user.email === 'admin') {
        res.render('user-register')
    }
})

app.post('/admin/register', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return;
    }

    if (req.user.email === 'admin') {
        User.register({
            email: req.body.email,
            name: req.body.fullname,
            role: req.body.role,
            nickname: req.body.nickname

        }, req.body.password, (err, newUser) => { if (err) { console.log(err) }})
        res.redirect('/dashboard')
    }
})

app.post('/admin/requests/accept', async (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
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
        projectStatus: 'Em Planejamento',
    })

    const assignedDevelopers = req.body.assignedDevelopers

    Promise.all(assignedDevelopers.map(async (developerId) => {
        let foundDeveloper = await User.findById(developerId)

        newProject.developers.push(foundDeveloper)
    })).then(() => {
        newProject.save()
    })

    res.redirect('/dashboard')
})

app.post('/admin/requests/decline', async (req, res) => {
    const requestId = req.body.decline

    await ServiceRequest.findByIdAndRemove(requestId)

    res.redirect('/admin/requests')
})

/* Server Start */

app.listen(3000, () => {
    console.log("Server running");
})