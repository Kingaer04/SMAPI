import express from 'express'
import reportController from '../controllers/reportController.js'
import { userController } from '../controllers/userController.js'

const router = express.Router()

router.get('/supervisee/:hodID', userController.departmentData)
router.post('/supervisee/:hodId/:Id/:userId', reportController.handleSendToAdmin)
router.post('/supervisee/:Id', reportController.handleSendBackToEmployee)
// Custom route for retrieving reports by department
router.get('/departments/:id/reports', reportController.getReportsByDepartment)

export default router
