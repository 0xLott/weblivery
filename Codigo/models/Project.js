const mongoose = require('mongoose')
const { todoItemSchema } = require('./ToDoItem')
const { userSchema } = require('./User')

const projectSchema = new mongoose.Schema({
    clientName: String,
    clientEmail: String,
    clientPhone: String,
    projectName: String,
    description: String,
    owner: String,
    deadline: String,
    status: Number,
    todolist: [todoItemSchema],
    developers: [userSchema]
})

module.exports = mongoose.model("Project", projectSchema)