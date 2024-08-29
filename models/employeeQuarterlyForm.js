import mongoose from 'mongoose';


const employeeAppraisalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  review: String,
  employeeName: String,
  jobTitle: String,
  reviewDate: String,
  idNumber: String,
  managerName: String,
  department: {type: mongoose.Schema.Types.ObjectId, ref: 'Department'},
  unit: String,
  division: String,
  supervisorName: String,
  commentOne: String,
  commentTwo: String,
  commentThree: String,
  dep: String,
  formGridData: [
    {
      selfRating: { type: Number, required: true },
      supervisorRating: { type: Number, required: true },
      average: { type: Number, required: true }
    }
  ],
  employeeFormData: [
    {
      employeeTopJobDescription: { type: String, required: true },
      supervisorRating: { type: Number, required: true },
      average: { type: Number, required: true },
      supervisorComment: { type: String, required: true }
    }
  ],
  recordData: [
    {
      times: { type: Number, required: true },
      scores: { type: Number, required: true },
      description: { type: String, required: true }
    }
  ],
  codeAData: [
    {
      times: { type: Number, required: true },
      scores: { type: Number, required: true },
      description: { type: String, required: true }
    }
  ],
  codeBData: [
    {
      times: { type: Number, required: true },
      scores: { type: Number, required: true },
      description: { type: String, required: true }
    }
  ],
  codeCData: [
    {
      times: { type: Number, required: true },
      scores: { type: Number, required: true },
      description: { type: String, required: true }
    }
  ],
  newGoalData: [
    {
      description: { type: String, required: false }
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Needs Correction'],
    default: 'Pending',
  }
}, { timestamps: true });

const EmployeeAppraisal = mongoose.model('EmployeeAppraisal', employeeAppraisalSchema)

export default EmployeeAppraisal
