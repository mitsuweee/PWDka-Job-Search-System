const express = require ('express')
const adminController = require('../controllers/admin_controller')
const adminRouter = express.Router()


adminRouter.post('/register', adminController.registerAdmin) // Registration
adminRouter.post('/login', adminController.loginAdmin) // Login Admin


adminRouter.get('/view/admins', adminController.viewAdmins) // Get all admins
adminRouter.get('/view/users', adminController.viewUsers) // Get all verified users
adminRouter.get('/view/companies', adminController.viewCompanies) //get all verified companies
adminRouter.get('/view/all/joblisting/newesttooldest', adminController.viewAllJobListingNewestToOldest) //get all Job Listing Newest To Oldest
adminRouter.get('/view/all/joblisting/oldesttonewest', adminController.viewAllJobListingOldestToNewest) //get all Job Listing Oldest To Newest
adminRouter.get('/view/joblisting/:id', adminController.viewJobListing) //get Job Listing
adminRouter.get('/view/:id', adminController.viewAdminViaId) //View Company Via ID


adminRouter.get('/view/user/:first_name', adminController.searchUser) //Search User

adminRouter.put('/update/:id', adminController.updateJobListing) //Update Job Listing
adminRouter.put('/update/password/:id', adminController.adminChangePassword) //Admin Change Password


adminRouter.delete('/delete/user/:id', adminController.deleteUser) // Delete User
adminRouter.delete('/delete/company/:id', adminController.deleteCompany) // Delete Company
adminRouter.delete('/delete/joblisting/:id', adminController.deleteJob) // Delete Job Listing








module.exports = adminRouter