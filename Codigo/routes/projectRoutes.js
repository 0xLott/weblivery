const express = require('express')
const router = express.Router()
router.use(express.json())

const controller = require('../controllers/projectController')

// Gets

router.get('/:projectId', controller.renderProject)

router.get('/:projectId/metrics', controller.renderMetrics)

// Posts

router.post('/:projectId/update', controller.editProjectDetails)

router.post('/:projectId/todolist/create', controller.createTodolistItem)

router.post('/:projectId/todolist/edit/:taskId', controller.editTodolistItem)

// Router

module.exports = router