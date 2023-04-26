const mongoose = require('mongoose')
const { todoItemSchema } = require('./ToDoItem')
const { userSchema } = require('./User')

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

module.exports = mongoose.model("Project", projectSchema)