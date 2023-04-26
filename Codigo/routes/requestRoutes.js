const express = require('express')
const router = express.Router()
router.use(express.json())

const controller = require('../controllers/requestController')

// Gets

router.get('/', controller.renderForm)

router.get('/view', controller.viewForms)

// Posts

router.post('/', controller.sendForm)

router.post('/accept', controller.acceptRequest)

router.post('/decline', controller.declineRequest)

// Router

module.exports = router
