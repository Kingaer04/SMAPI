import express from 'express'
import adminRoute from './adminRoute.js'
import userRoute from './userRoute.js'
import departmentRoute from './departmentRoute.js'
import reportRoute from './reportRoute.js'

const router = express.Router()

router.use('/user', adminRoute)
router.use('/employee', userRoute)
router.use('/department', departmentRoute)
router.use('/report', reportRoute)

export default router
