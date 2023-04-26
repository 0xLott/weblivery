const express = require('express')
const router = express.Router()
router.use(express.json())

const controller = require('../controllers/projectController')

// Gets

router.get('/:projectId', controller.renderProject)

// Posts

router.post('/:projectId/todolist/create', controller.createTodolistItem)

router.post('/:projectId/todolist/edit/:taskId', controller.editTodolistItem)

// Router

module.exports = router
