import express from 'express'
import reportController from '../controllers/reportController.js'

const router = express.Router()


// EmployeeAppraisal routes
// router.get('/reports', reportController.getAllReports)
// router.get('/reports/:id', reportController.getReportById)
router.post('/reports/:id', reportController.createReport)
router.get('/userReports/:userId', reportController.getUserReportData)
router.post('/userNote/:userId', reportController.addNote)
router.post('/editUserNote/:userId/:noteId', reportController.editNote)
router.post('/updatePinNote/:userId/:noteId', reportController.updateNotePin)
router.get('/getUserNote/:userId', reportController.getAllNotes)
router.delete('/deleteUserNote/:userId/:noteId', reportController.deleteNote)
// router.put('/reports/:id', reportController.updateReport)
// router.delete('/reports/:id', reportController.deleteReport)

export default router