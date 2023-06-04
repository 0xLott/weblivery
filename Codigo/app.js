require('dotenv').config()
const express = require("express")
const app = express()
const session = require('express-session')
const mongoose = require('mongoose').set('strictQuery', true)
const bodyParser = require("body-parser") 
const ejs = require('ejs')
const passport = require('passport')

app.set('view engine', 'ejs') 
app.use(express.static(__dirname + '/public')) 
app.use(bodyParser.urlencoded({ extended: true })) 
app.use(session({secret: process.env.SECRET, resave: false, saveUninitialized: true })) 
app.use(passport.initialize()) 
app.use(passport.session()) 

const userRoutes = require('./routes/userRoutes')
const requestRoutes = require('./routes/requestRoutes')
const projectRoutes = require('./routes/projectRoutes')

app.use('/user', userRoutes)
app.use('/request', requestRoutes)
app.use('/project', projectRoutes)

app.get('/', (req, res) => {
    res.render('test-form')
})

mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@db-cluster.cjjdosp.mongodb.net/weblivery')

app.listen(3000, () => { console.log("Server running") })