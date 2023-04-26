const mongoose = require('mongoose')
const { userSchema } = require('./User')

const todoItemSchema = new mongoose.Schema({
    title: String,
    status: Number,
    developer: userSchema
})

const ToDoItem = mongoose.model("ToDoItem", todoItemSchema)

module.exports = {
    todoItemSchema, ToDoItem
}