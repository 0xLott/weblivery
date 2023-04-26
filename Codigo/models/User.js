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

User.register({email: 'admin', name: 'Guilherme Gentili', nickname: 'Ademiro', role: 'Administrador'}, 'admin', (err, newUser) => {
    if (err) {
        console.log('Admin user already exists');
        return
    }
       
    console.log('Admin user created');
})

module.exports = {
    User, userSchema
}
