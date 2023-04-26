const mongoose = require('mongoose')

const serviceRequestSchema = new mongoose.Schema({
    requesterFullname: String,
    requestTitle: String,
    requestDescription: String,
    email: String,
    whatsapp: String,
    phone: Number
})

module.exports = mongoose.model("ServiceRequest", serviceRequestSchema)