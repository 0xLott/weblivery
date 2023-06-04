const express = require('express')
const router = express.Router()
router.use(express.json())

const controller = require('../controllers/userController')

// Gets

router.get('/login', controller.renderLoginForm)

router.get('/login/error', controller.renderLoginFormError)

router.get('/dashboard', controller.renderDashboard)

router.get('/register', controller.renderRegisterForm)

router.get('/notification', controller.renderNotifications)

// Posts

router.post('/login', controller.auth)

router.post('/quit', controller.logout)

router.post('/register', controller.sendRegisterForm)

router.post('/notification', controller.dismissNotification)

// Router

module.exports = router