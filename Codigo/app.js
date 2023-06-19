require('dotenv').config()
const express       = require("express")
const app           = express()
const session       = require('express-session')
const mongoose      = require('mongoose').set('strictQuery', true)
const bodyParser    = require("body-parser") 
const ejs           = require('ejs')
const passport      = require('passport')

const userRoutes    = require('./routes/userRoutes')
const requestRoutes = require('./routes/requestRoutes')
const projectRoutes = require('./routes/projectRoutes')


// View Engine
app.set('view engine', 'ejs') 

// Plugins
app.use(express.static(__dirname + '/public')) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: true })) 
app.use(passport.initialize()) 
app.use(passport.session()) 

app.use('/user', userRoutes)
app.use('/request', requestRoutes)
app.use('/project', projectRoutes)

app.get('/', (req,res) => {
    res.render(__dirname + '/views/landingPage.ejs');
})

// Database
mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@db-cluster.cjjdosp.mongodb.net/weblivery')

app.listen(process.env.PORT, () => { console.log("Server running") })