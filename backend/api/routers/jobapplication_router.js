const express = require("express");
const jobApplicationController = require("../controllers/jobapplication_controller");
const jobApplicationRouter = express.Router();
const bodyParser = require("body-parser");
const app = express();

jobApplicationRouter.post(
  "/upload/resume",
  jobApplicationController.uploadResume
); //Upload Resume

jobApplicationRouter.get(
  "/applications/:id",
  jobApplicationController.viewAllUsersApplicationsViaJobListingId
); // View All APPLICATION VIA Job Listing ID

jobApplicationRouter.get(
  "/applications/user/:id",
  jobApplicationController.viewUserJobApplicationStatus
); // View All APPLICATION VIA USER ID

jobApplicationRouter.get(
  "/count/:jobListingId",
  jobApplicationController.getApplicantCount
); // Get Applicant count -kael

jobApplicationRouter.get(
  "/:status/:id",
  jobApplicationController.viewAllUsersByStatus
); // View Reviewed Applications VIA Job Listing ID

jobApplicationRouter.put(
  "/status/reviewed/:id",
  jobApplicationController.updateJobApplicationStatus
); //Upload Resume

jobApplicationRouter.delete(
  "/delete/:id",
  jobApplicationController.deleteJobApplication
); // Delete Job Listing

jobApplicationRouter.put(
  "/status/:id",
  jobApplicationController.updateJobApplicationStatus
); // Route for updating job application status - MITS

jobApplicationRouter.get(
  "/status/all/:jobListingId",
  jobApplicationController.getAllApplicantsByStatus
);
// Get all applicants by status - mits

module.exports = jobApplicationRouter;
