import mongoose from 'mongoose'

const submittedReportSchema = new mongoose.Schema({
    employeeAppraisalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeAppraisal',
        required: true,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
      },
      hoDId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true,
      },
      sentToAdminDate: {
        type: Date,
        required: true,
      }
})

const HodApproval = mongoose.model('HodApproval', submittedReportSchema)

export default HodApproval
