import EmployeeAppraisal from '../models/employeeQuarterlyForm.js'
import Department from '../models/department.js'
import Admin from '../models/admin.js'
import HodApproval from '../models/submittedReport.js'
import NoteData from '../models/note.js'


function getEmployeeParams(body) {
  return { review:  body.review, employeeName: body.employeeName, jobTitle: body.jobTitle, reviewDate: body.reviewDate,idNumber: body.idNumber, managerName: body.managerName, unit: body.unit, division: body.division, supervisorName: body.supervisorName, commentOne: body.commentOne, commentTwo: body.commentTwo, commentThree: body.commentThree, formGridData: body.formGridData, employeeFormData: body.employeeFormData, recordData: body.recordData, codeAData: body.codeAData, codeBData: body.codeBData, codeCData: body.codeCData, newGoalData: body.newGoalData, tatus: "Approved" }
}


const reportController = {
  createReport: async (req, res) => {
    try {
      const {id} = req.params
      const { review, employeeName, jobTitle, reviewDate, idNumber, managerName, department, unit, division, supervisorName, commentOne, commentTwo, commentThree, formGridData, employeeFormData, recordData, codeAData, codeBData, codeCData, newGoalData, status, dep } = req.body
      const userId = id

      // Find the department by name
      const departments = await Department.findOne({ name: department }).populate('employees')

      if (!departments) {
        return res.status(404).json({ message: 'Department not found' })
      }

      // Search for the HOD in the Admin collection
      const hod = await Admin.findOne({ role: ["HOD", "admin"], department: departments.name })

      if(!hod) {
        return res.status(404).json({ message: 'HOD not found' })
      }

      // Find all reports with the given userId
      const existingReports = await EmployeeAppraisal.find({ userId });

      // Find the specific report with the matching review
      const existingReport = existingReports.find(report => report.review === review);

      if (existingReport) {
        // Update the existing report with the new data
        existingReport.employeeName = employeeName;
        existingReport.jobTitle = jobTitle;
        existingReport.reviewDate = reviewDate;
        existingReport.idNumber = idNumber;
        existingReport.managerName = managerName;
        existingReport.department = department._id;
        existingReport.unit = unit;
        existingReport.division = division;
        existingReport.supervisorName = supervisorName;
        existingReport.commentOne = commentOne;
        existingReport.commentTwo = commentTwo;
        existingReport.commentThree = commentThree;
        existingReport.formGridData = formGridData;
        existingReport.employeeFormData = employeeFormData;
        existingReport.recordData = recordData;
        existingReport.codeAData = codeAData;
        existingReport.codeBData = codeBData;
        existingReport.codeCData = codeCData;
        existingReport.newGoalData = newGoalData;
        existingReport.status = status;
        existingReport.dep = dep

        await existingReport.save();

        res.status(200).json(existingReport); 
      } else {
        // Create a new report if it doesn't exist or if the review is different
        const newReport = new EmployeeAppraisal({ userId, review, employeeName,
          jobTitle, reviewDate, idNumber, managerName, department: department._id, unit, division, supervisorName,commentOne, commentTwo, commentThree, formGridData, employeeFormData, recordData, codeAData, codeBData, codeCData,
          newGoalData, status })

        await newReport.save()

        // Add the new report to the department's employees array
        departments.employees.push(newReport._id)
        await departments.save();

        res.status(201).json(newReport);
      }
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  getReportsByDepartment: async (req, res) => {
    try {
      const { departmentName } = req.params;
      const department = await Department.findOne({ name: departmentName }).populate('employees');
      res.status(200).json(department.employees)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  },
  getUserReportData: async (req, res) => {
    try {
      const { userId } = req.params
  
      // Get the current month
      const currentMonth = new Date().getMonth() + 1; // Month is 0-indexed, so add 1

      // Fetch all user report data from the EmployeeAppraisal model
      const userReportData = await EmployeeAppraisal.find({ userId });

      // Find the report with a reviewDate range that includes the current month
      const matchingReport = userReportData.find(report => {
        const [startDate, endDate] = report.reviewDate.split(' - '); 
        const startMonth = new Date(startDate).getMonth() + 1; 
        const endMonth = new Date(endDate).getMonth() + 1; 

        // Check if the current month is within the review date range
        return !(currentMonth >= startMonth && currentMonth <= endMonth);
      });

      if (!matchingReport) {
        return res.status(404).json({ message: 'User report data not found' });
      }

      res.status(200).json(matchingReport); 
    } catch (error) {
      res.status(500).json({ message: 'Error fetching user report data', error: error.message })
    }
  },
  handleSendToAdmin: async (req, res) => {
    try {
      const { hodId, Id, userId } = req.params
  
      // Check if an employee appraisal record already exists for the given id and userId
      const existingAppraisal = await HodApproval.findOne({
        employeeAppraisalId: Id,
        userId: userId,
      })

      const existingEmployeeAppraisal = await EmployeeAppraisal.findById(Id)
      console.log(req.body.review)
  
      if (existingAppraisal) {
        if(existingEmployeeAppraisal.review === req.body.review){
          // If an appraisal record already exists, send a message that the form has already been submitted
          return res.status(400).json({ message: 'Employee appraisal form has already been submitted' });
        }
      }
      
      await EmployeeAppraisal.findByIdAndUpdate(
        Id,
        {
          ...getEmployeeParams(req.body),
          status: 'Approved'
        },
        {
          new: true,
          runValidators: true,
        }
      )
      // Create a new HodApproval document
      const newHodApproval = new HodApproval({
        employeeAppraisalId: Id,
        userId: userId,
        hoDId: hodId,
        sentToAdminDate: new Date(),
      });

      await newHodApproval.save();

      // Update the reportStatus field in the Admin collection
      await Admin.findOneAndUpdate({ _id: userId },
        { reportStatus: "Approved" },
        {
          new: true,
          runValidators: true,
        }
      );

      // Display a success message or update the UI as needed
      res.status(200).json('Approved!')
      
    } catch (error) {
      res.status(500).json({ message: error.message });
      // Display an error message or handle the error as needed
    }
  },
  handleSendBackToEmployee: async (req, res) => {
  try {
    const { Id } = req.params;
    console.log(Id);

    // Check if the employeeAppraisalId is valid
    const existingAppraisal = await EmployeeAppraisal.findById(Id);
    if (!existingAppraisal) {
      return res.status(404).json({ error: 'Employee appraisal not found' });
    }

    // Update the existing EmployeeAppraisal document with the appropriate status and other changes
    const updatedAppraisal = await EmployeeAppraisal.findByIdAndUpdate(
      Id,
      {
        ...getEmployeeParams(req.body),
        status: 'Pending'
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({ message: 'Sent back to employee successfully', appraisal: updatedAppraisal });
  } catch (error) {
    console.error('Error sending back to employee:', error);
    res.status(500).json({ error: 'Error sending back to employee' });
  }
},
  addNote: async (req, res) => {
    const { title, content, tags } = req.body;
    const { userId } = req.params;
  
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
  
    if (!content) {
      return res.status(400).json({
        message: "Content is required",
      });
    }
  
    try {
      const note = new NoteData({
        title,
        content,
        tags: tags ? tags : [],
        userId,
      });
  
      await note.save();
      res.status(200).json("Note added successfully");
    } catch (error) {
      res.status(500).json("Internal server error");
    }
  },
  editNote: async (req, res) => {
    const { noteId, userId } = req.params;
    const { title, content, tags, isPinned } = req.body;
  
    if (!title && !content && !tags) {
      return res.status(400).json({ message: "No changes provided" });
    }
  
    try {
      const noteCheck = await NoteData.findOne({ _id: noteId, userId: userId });
      if (!noteCheck) {
        return res.status(404).json({ message: "Note not found" });
      }
  
      const updatedNote = {
        title: title || noteCheck.title,
        content: content || noteCheck.content,
        tags: tags || noteCheck.tags,
        isPinned: typeof isPinned === 'boolean' ? isPinned : noteCheck.isPinned,
      };
  
      const updatedNoteData = await NoteData.findByIdAndUpdate(noteId, updatedNote, {
        new: true,
        runValidators: true,
      });
  
      if (!updatedNoteData) {
        return res.status(500).json({ message: "Failed to update note" });
      }
  
      res.status(200).json({ message: "Note updated successfully", note: updatedNoteData });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
  getAllNotes: async (req, res) => {
    const {userId} = req.params
    try {
      const notes = await NoteData.find({ userId: userId }).sort({ isPinned: -1 })

      return res.json({notes, message: "All notes retrived successfully"})
    } catch (error) {
      res.status(500).json({ message: "Internal server Error" })
    }
  },
  deleteNote: async (req, res) => {
    const {noteId, userId} = req.params
    console.log(noteId)
    console.log(userId)
    try {
      const note = await NoteData.findOne({ _id: noteId, userId: userId })
      console.log(note)

      if(!note) {
        return res.status(404).json({ message: "Note not found" })
      }

      await NoteData.deleteOne({ _id: noteId, userId: userId })

      res.status(200).json({ message: "Note deleted successfully" })
    } catch(error) {
      res.status(500).json({ message: "Internal server Error" })
    }
  },
  updateNotePin: async(req, res) => {
    const { noteId, userId } = req.params;
    const { isPinned } = req.body;
  
    try {
      const noteCheck = await NoteData.findOne({ _id: noteId, userId: userId });
      if (!noteCheck) {
        return res.status(400).json({ message: "Note does not exist" });
      }
  
      const updatedNotePin = {
        isPinned: isPinned
      };
  
      await NoteData.findByIdAndUpdate(noteId, updatedNotePin, { new: true });
  
      res.status(200).json({ message: "Note has been updated successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}

// Function to create the default departments
const createDefaultDepartments = async () => {
  try {
    const defaultDepartments = ['RCD', 'DEM', 'DAS', 'AHR', 'DPA'];

    // Check if the default departments already exist
    const existingDepartments = await Department.find({ name: { $in: defaultDepartments } });
    if (existingDepartments.length === defaultDepartments.length) {
      console.log('Default departments already exist. Skipping creation.');
      return;
    }

    // Create the missing default departments
    const createdDepartments = await Promise.all(
      defaultDepartments.map(async (departmentName) => {
        const department = new Department({ name: departmentName });
        await department.save();
        return department;
      })
    );

    console.log('Default departments created:', createdDepartments.map((d) => d.name));
  } catch (error) {
    console.error('Error creating default departments:', error);
  }
};

// Call the function to create the default departments
createDefaultDepartments();

export default reportController
