const express = require('express')
const router = express.Router()
router.use(express.json())

const controller = require('../controllers/userController')

// Gets

router.get('/login', controller.renderLoginForm)

router.get('/dashboard', controller.renderDashboard)

router.get('/register', controller.renderRegisterForm)

// Posts

router.post('/login', controller.auth)

router.post('/quit', controller.logout)

router.post('/register', controller.sendRegisterForm)

// Router

module.exports = router