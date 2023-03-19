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

//mongoose.connect('mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@db-cluster.cjjdosp.mongodb.net/<BD_NAME>')

// Schemas

// Passport Serialization

// Test Route

app.get('/', (req, res) => {
    res.render('form')
})

app.listen(3000)

// app.listen(process.env.PORT || 3000)