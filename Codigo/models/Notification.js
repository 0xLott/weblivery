const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    title: String,
    message: String,
})

const Notification = mongoose.model("Notification", notificationSchema)

module.exports = {
    notificationSchema, Notification
}