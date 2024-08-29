import Admin from "../models/admin.js"


function getUserParams(body) {
    return {
        role: body.role,
        department: body.department,
    }
}

export const userController = {
    getStaffs: async (req, res) => {
        try {
            // Retrieve all staff members, excluding the 'hash' and 'salt' fields
            const staffs = await Admin.find({}).select("-hash -salt");
    
            // Get the total number of staff
            const total = await Admin.countDocuments({});
    
            // Get the number of staff in the IT department
            const itCount = await Admin.countDocuments({ role: "IT" });
    
            // Get the number of staff in each department
            // const departmentCounts = await Admin.aggregate([
            //     { $group: { _id: "$department", count: { $sum: 1 } } },
            //     { $project: { _id: 0, department: "$_id", count: 1 } }
            // ]);
    
            // Get the number of corpers
            const corpersCount = await Admin.countDocuments({ position: "Corper" })
    
            res.status(200).json({
                staffs,
                total,
                itCount,
                // departmentCounts,
                corpersCount
            });
        } catch (error) {
            res.status(404).json({
                message: error.message
            });
        }
    },
    deleteUser: async (req, res, next) => {
        try {
            await Admin.findByIdAndDelete(req.params.id)
            res.status(200).json("User Account deleted successfully!")
        } catch (error) {
            next(error)
        }
    },
    weather: (req, res) => {
        const cityName = req.body.cityname;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=cfdde0d19271f4b821913fe51712ea0c`
      
        https.get(url, (response) => {
          response.on("data", (data) => {
            const weatherData = JSON.parse(data);
            const temp = weatherData["main"]["temp"];
            const description = weatherData["weather"][0]["description"];
            const icon = weatherData["weather"][0]["icon"];
            const imageUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
      
            const responseData = {
              temperature: temp,
              description: description,
              iconUrl: imageUrl,
            };
      
            res.json(responseData)
          });
        });
    },
    departmentData: async (req, res) => {
        try {
            const {hodID} = req.params
    
            const admin = await Admin.findById(hodID)
            let staff
            if (admin.role === 'HOD' || admin.role === 'admin') {
                staff = await Admin.find({ role: { $in: ['staff', 'IT', 'corper'] }, department: admin.department })
            }
            res.json(staff)
        } catch (err) {
            res.status(500).json({ message: err.message })
        }
    },
    getUserData: async (req, res) => {
        try {
            const {id} = req.params
            const staffData = await Admin.findById(id)
            res.json(staffData)   
        } catch (error) {
            res.status(404).json({message: error.message})
        }
    },
    update: async (req, res, next) => {
    try {
        const { id } = req.params;
        const updatedUser = await Admin.findByIdAndUpdate(
            id,
            { $set: getUserParams(req.body) },
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json(req.user)
    } catch (error) {
        next(error);
    }
}
}
