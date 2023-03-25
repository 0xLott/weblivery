/* 

Criar um usuario Admin Master persistente:

- Quando o servidor iniciar um usuario master deve ser gerado para que o admin não se tranque
para fora do sistema.

- Significa que, se o usuario já existir, não é preciso criar outro. Caso contrario
crie.


Ideias:

- Um hub para gerenciamento de funcionarios que só o admin pode usar, na navbar dele vai aparecer
um menu novo que só ele consegue ver.

*/

require('dotenv').config()

const express = require("express")
const session = require('express-session')

const mongoose = require('mongoose').set('strictQuery', true)
const bodyParser = require("body-parser")
const ejs = require('ejs');

const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const app = express()

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(session({secret: 'Weblivery', resave: false, saveUninitialized: true }))
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@db-cluster.cjjdosp.mongodb.net/weblivery')

/* Schemas */

const serviceRequestSchema = new mongoose.Schema({
    requesterFullname: String,
    requestTitle: String,
    requestDescription: String,
    email: String,
    phone: Number,
    whatsapp: String
})

const todoItemSchema = new mongoose.Schema({
    title: String,
    content: String
})

const projectSchema = new mongoose.Schema({
    clientName: String,
    projectOwner: String,
    projectName: String,
    description: String,
    status: String,
    todolist: [todoItemSchema]
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    nickname: String,
    name: String,
    role: String,
    projects: [projectSchema]
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})

/* Models */

const User = new mongoose.model("User", userSchema)

const Project = new mongoose.model("Project", projectSchema)

const ToDoItem = new mongoose.model("ToDoItem", todoItemSchema)

const ServiceRequest = new mongoose.model("ServiceRequest", serviceRequestSchema)

/* Passport Init */ 

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Admin persistente - Explicado no topo do arquivo

User.register({
    email: 'admin',
    name: 'Guilherme Gentili',
    nickname: 'Ademiro',
    role: 'Administrador'
}, 'admin', (err, newUser) => {
    if (err) {
        console.log('Admin ja criado');
    } else {
        console.log('User Admin gerado');
    }
})

/* Routers (Temporario, vamos usar MVC, será mudado de arquivo posteriormente) */

app.get('/login', (req, res) => {
    if (!req.isAuthenticated()) {
        res.render('login')
    }
    res.render('dashboard')
})

app.post('/login', (req, res) => {
    let user = new User({
        email: req.body.email,
        password: req.body.password
    })

    passport.authenticate('local')(req, res, () => {
        req.login(user, (err) => {})
        res.redirect('/dashboard')
    })
})

app.get('/', (req, res) => {
    res.render('form')
})

app.post('/', (req, res) => {
    const sr = new ServiceRequest({
        requesterFullname: req.body.fullname,
        requestTitle: req.body.title,
        requestDescription: req.body.description,
        email: req.body.email,
        phone: req.body.phone,
        whatsapp: req.body.whatsapp
    })

    sr.save()

    console.log(sr);

    res.render('login')
})

app.get('/dashboard', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }
        res.render('dashboard', {user: req.user})
})

app.get('/admin/requests', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    if (req.user.email === 'admin') {
    
        // let allRequests = []
        // let Requests = ServiceRequest.find({})

        // Requests.then((requests) => {
        //     requests.map((request) => {
        //         allRequests.push(request)
        //     })
        // })

        // console.log(Requests);
        // console.log(allRequests);

        res.render('requests', {requests: allRequests})
    }
})

app.get('/admin/register', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    if (req.user.email === 'admin') {
        res.render('register')
    }
})

app.post('/admin/register', (req, res) => {
    if (!req.isAuthenticated()) {
        res.redirect('/login')
        return
    }

    if (req.user.email === 'admin') {
        User.register({
            email: req.body.email,
            name: req.body.fullname,
            role: req.body.role,
            nickname: req.body.nickname
        }, req.body.password, (err, newUser) => {
            if (err) {
                console.log('Erro ao cadastrar user');
            } else {
                console.log('Novo usuario criado');
            }
        })
        res.redirect('/dashboard')
    }
})

app.get('/logout', (req, res) => {
    if (req.isAuthenticated()) {
        req.logout((err) => {})
        res.redirect('/login')
    }
})

app.listen(3000, () => {
    console.log("Server running");
})