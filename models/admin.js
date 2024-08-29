import mongoose from "mongoose"
import passportLocalMoongoose from 'passport-local-mongoose'

const AdminSchemma = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    skill: {
        type: String,
    },
    phone: {
        type: Number,
        required: true,
    },
    department: {
        type: String,
        enum: ["DAS", "DEM", "RCD", "AHR", "DPA"]
    },
    avatar: {
        type: String,
        default: "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Free-Download.png"
    },
    role: {
        type: String,
        enum: ["staff", "admin", "HOD", "IT", "corper" ],
    },
    reportStatus: {
        type: String,
        enum: ['Not Available', 'Pending', 'Approved', 'Needs Correction'],
        default: 'Not Available',
    }, 
}, {timestamps: true})

AdminSchemma.plugin(passportLocalMoongoose, {
    usernameField: "email"
})

// Middleware function to filter data based on the admin's department
AdminSchemma.pre('find', function(next) {
    if (this.getQuery().role === 'HOD') {
        this.where('department').equals(this.getQuery().department)
    }
    next()
})

const Admin = mongoose.model('Admin', AdminSchemma)

export default Admin
