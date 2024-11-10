const express = require("express");
const adminController = require("../controllers/admin_controller");
const adminRouter = express.Router();

adminRouter.post("/register", adminController.registerAdmin); // Registration
adminRouter.post("/login", adminController.loginAdmin); // Login Admin
adminRouter.post("/email", adminController.sendEmailConcern); // Send Email In Contact us page

adminRouter.get("/view/count", adminController.viewCounts); // Get all count
adminRouter.get("/view/admins", adminController.viewAdmins); // Get all admins
adminRouter.get("/view/users", adminController.viewUsers); // Get all verified users
adminRouter.get("/view/companies", adminController.viewCompanies); //get all verified companies
adminRouter.get(
  "/view/all/joblisting/newesttooldest",
  adminController.viewAllJobListingNewestToOldest
); //get all Job Listing Newest To Oldest
adminRouter.get("/view/joblisting/:id", adminController.viewJobListing); //get Job Listing
adminRouter.get("/view/:id", adminController.viewAdminViaId); //View Company Via ID
adminRouter.get("/view/verify/status:id", adminController.verifyAdminStatus); //Verify Admin Status

adminRouter.get("/view/user/:first_name", adminController.searchUser); //Search User

adminRouter.put("/update/:id", adminController.updateJobListing); //Update Job Listing
adminRouter.put("/update/password/:id", adminController.adminChangePassword); //Admin Change Password
adminRouter.put("/update/email/:id", adminController.updateAdminEmail); //Admin Change email
adminRouter.put("/update/details/:id", adminController.updateAdmin); //Admin Details
adminRouter.put("/update/deactivate/:id", adminController.deactivateAdmin); //Deactivate Admin
adminRouter.put("/update/deactivate/user/:id", adminController.deactivateUser); //Deactivate User
adminRouter.put(
  "/update/deactivate/company/:id",
  adminController.deactivateCompany
); //Deactivate User

adminRouter.delete("/delete/user/:id", adminController.deleteUser); // Delete User
adminRouter.delete("/delete/admin/:id", adminController.deleteAdmin); // Delete Admin
adminRouter.delete("/delete/company/:id", adminController.deleteCompany); // Delete Company
adminRouter.delete("/delete/joblisting/:id", adminController.deleteJob); // Delete Job Listing

module.exports = adminRouter;
