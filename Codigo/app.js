require('dotenv').config()

const express = require("express")
const mongoose = require('mongoose').set('strictQuery', true)
const bodyParser = require("body-parser")
const ejs = require('ejs');
const session = require('express-session')
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

// Conferir se os schemas batem certo com o gp

const todoItemSchema = new mongoose.Schema({
    content: String,
    project: String,
})

const projectSchema = new mongoose.Schema({
    name: String,
    description: String,
    client: String,
    status: String,
})

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    role: String,
    projects: [projectSchema],
    todolist: [todoItemSchema]
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})

const User = new mongoose.model("User", userSchema)

const Project = new mongoose.model("Project", projectSchema)

const ToDoItem = new mongoose.model("ToDoItem", todoItemSchema)

passport.use(User.createStrategy())
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// ROTAS DE TESTE

app.get('/', (req, res) => {
    res.render('form')
})

app.post('/', (req, res) => {
    User.register({email: req.body.email}, req.body.password, (err, newUser) => {
        // Ta criando o user no Mongo certinho
    })
})

app.listen(3000)

// app.listen(process.env.PORT) para quando for dar deploy