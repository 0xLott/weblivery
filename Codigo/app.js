require('dotenv').config()

const express = require("express")
const app = express()
const session = require('express-session')
const mongoose = require('mongoose').set('strictQuery', true)
const bodyParser = require("body-parser") 
const ejs = require('ejs') 
const passport = require('passport')

// Models

const { User } = require('./models/User')
const { ToDoItem } = require('./models/ToDoItem')
const Project = require('./models/Project')
const ServiceRequest = require('./models/ServiceRequest')

app.set('view engine', 'ejs') 
app.use(express.static(__dirname + '/public')) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: true })) 
app.use(passport.initialize()) 
app.use(passport.session()) 

// Rotas

const userRoutes = require('./routes/userRoutes')
const requestRoutes = require('./routes/requestRoutes')
const projectRoutes = require('./routes/projectRoutes')

// user route
// dashboard
app.use('/user', userRoutes)
app.use('/request', requestRoutes)
app.use('/project', projectRoutes)

mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@db-cluster.cjjdosp.mongodb.net/weblivery')

User.register({email: 'admin', name: 'Guilherme Gentili', nickname: 'Ademiro', role: 'Administrador'}, 'admin', (err, newUser) => {
    if (err) {
        console.log('Admin user already exists');
        return
    }
       
    console.log('Admin user created');
})

/* Dashboard */

// app.get('/dashboard', async (req, res) => {

// })

// app.get('/dashboard/:projectId', async (req, res) => {

// })

// /* TodoList */

// app.post('/dashboard/:projectId/todolist/new', async (req, res) => {

// })

// app.post('/dashboard/:projectId/todolist/:taskId/edit', async (req, res) => {

// })

// /* Admin Routes */

// app.get('/admin/requests', async (req, res) => {

// })

// app.get('/admin/register', (req, res) => {

// })

// app.post('/admin/register', (req, res) => {

// })

/* Server Start */

app.listen(3000, () => {
    console.log("Server running");
})