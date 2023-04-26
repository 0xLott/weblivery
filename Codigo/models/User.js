const mongoose = require('mongoose')
const passport = require('passport')
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    nickname: String,
    name: String,
    role: String
})

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'})

const User = mongoose.model("User", userSchema)

passport.use(User.createStrategy()) 
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

module.exports = {
    User, userSchema
}
