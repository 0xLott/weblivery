const mongoose = require('mongoose')

const serviceRequestSchema = new mongoose.Schema({
    requester: String,
    title: String,
    description: String,
    email: String,
    whatsapp: String,
    phone: String
})

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema)