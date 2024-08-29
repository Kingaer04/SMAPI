import express from 'express'
import { userController } from '../controllers/userController.js'


const router = express.Router()

router.get('/staffs', userController.getStaffs)
router.get("/update/:id", userController.getUserData)
router.post("/update/:id", userController.update)
router.delete('/staffs/:id', userController.deleteUser)

export default router
