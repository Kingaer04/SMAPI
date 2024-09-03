import Admin from '../models/admin.js'
import passport from 'passport'
import jwt from 'jsonwebtoken'

function getUserParams(body) {
    return {
        userName:  body.userName,
        email: body.email,
        role: body.role,
        avatar: body.avatar,
        phone: body.phone,
        department: body.department,
        address: body.address
    }
}

export const adminController = {
    SignUp: (req, res, next) => {
        if (req.skip) return next();

        let newUser = new Admin(getUserParams(req.body));
        Admin.register(newUser, req.body.password, (error, user) => {
            if (user) {
                res.status(201).json({
                    message: 'User created successfully',
                });
            } else {
                res.status(400).json({
                    error: `Failed to create user account`,
                    message: error.message
                });
                next(error);  // Pass the error to the next middleware
            }
        });

    },
    authenticate: (req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ message: 'Internal Server Error', error: err.message });
            }
            if (!user) {
                return res.status(401).json({ message: 'Authentication failed', error: info.message });
            }
            req.logIn(user, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Internal Server Error', error: err.message });
                }
                const token = jwt.sign({id:user._id}, process.env.JWT_SECRET)
                const {hash: has, salt:sal, ...rest} = user._doc
                res.cookie('token', token, {httpOnly: true}).status(200).json(rest)      
            });
            
        })(req, res, next)
    },
    verifyToken: (req, res, next) => {
        const token = req.cookies.token

        if(!token) return next(res.status(401).json({message: 'Unauthorized'}))

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) return next(res.status(403).json({message:'forbidden'}))
            
            req.user = user
            next()
        })
    },
    update: async (req, res, next) => {
    try {
        if (req.user.id !== req.params.id) return res.status(401).json({ error: 'Unauthorized! you can only update your account' });

        const updatedUser = await Admin.findByIdAndUpdate(req.user.id, {
            $set: getUserParams(req.body)
        }, { new: true })

        // Check if both old and new passwords are provided
        if (req.body.oldPassword && req.body.newPassword) {
            try {
                await updatedUser.changePassword(req.body.oldPassword, req.body.newPassword);
            } catch (error) {
                return res.status(400).json({ error: error.message });
            }
        } else if (req.body.oldPassword || req.body.newPassword) {
            return res.status(400).json({ error: 'Both old and new passwords must be provided.' });
        }
        updatedUser.changePassword = async function(oldPassword, newPassword) {
            // Check if the old password matches the one in the database
            const isMatch = await this.comparePassword(oldPassword);
            if (!isMatch) {
                throw new Error('Old password is incorrect');
            }
        
            // Update the password
            this.password = newPassword;
            await this.save();
        }

        res.status(200).json(updatedUser);
        } catch (error) {
        next(error);
        }
    },
    delete: async (req, res, next) => {
        if(req.user.id !== req.params.id) return (res.status(401).json({message: 'Unauthorized! You can only delete your account'}))
        try{
            await Admin.findByIdAndDelete(req.params.id)
            res.clearCookie('token')
            res.status(200).json("User Account deleted successfully!")
        }catch(error){
            next(error)
        }
    },
    signOut: async (req, res, next) => {
        try {
            res.clearCookie('token')
            res.status(200).json("User has logged out!")
        } catch (error) {
            next(error)
        }
    },
    getUser: async(req, res) => {
        try {
            const {id} = req.params
            const user = await Admin.findById(id)
            res.status(200).json(user)
        } catch (error) {
            res.status(404).json({ message: error.message })
        }
    },
}

// Function to create the default admin user
// const createDefaultAdmin = async () => {
//     try {
//       // Check if the default admin user already exists (by username and email)
//       const existingAdmin = await Admin.findOne({
//         username: 'Admin',
//         email: 'admin@adsr.info',
//         role: 'admin'
//       });
//       if (existingAdmin) {
//         console.log('Default admin user already exists.');
//         return;
//       }
  
//       // Create the default admin user
//       const admin = new Admin({
//         username: 'Admin',
//         email: 'admin@adsr.info',
//         role: 'admin',
//         // Add any other necessary fields for your user model
//       });
  
//       // Use Passport's register method to hash the password and save the user
//       Admin.register(admin, 'admin', (err, user) => {
//         if (err) {
//           console.error('Error creating default admin user:', err);
//           return;
//         }
//         console.log('Default admin user created:', user.username);
//       });
//     } catch (error) {
//       console.error('Error creating default admin user:', error);
//     }
//   };
  
//   // Call the function to create the default admin user
//   createDefaultAdmin();
