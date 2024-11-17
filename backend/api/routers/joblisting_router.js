const express = require("express");
const jobListingController = require("../controllers/joblisting_controller");
const joblistingRouter = express.Router();

joblistingRouter.post("/post/job", jobListingController.postJobs); //Post Jobs
joblistingRouter.get("/view/:id", jobListingController.viewJobListing); // View Job Listing
joblistingRouter.get("/view/count/:id", jobListingController.viewCounts); // View Job Listing

joblistingRouter.get(
  "/view/newesttooldest/:id",
  jobListingController.viewJobListingViaUserNewestToOldest
); // View Job listing via User ID Newest to oldest
joblistingRouter.get(
  "/view/newesttooldest/company/:id",
  jobListingController.viewJobsCreatedByCompanyNewestToOldest
); // View Job Listing Via Company ID Newest To OLDEST
joblistingRouter.put("/update/:id", jobListingController.updateJobListing); //Update Job Listing
joblistingRouter.put(
  "/update/deactivate/:id",
  jobListingController.deactivateJobListing
); //Deactivate Job Listing

joblistingRouter.delete("/delete/:id", jobListingController.deleteJob); // Delete Job Listing

module.exports = joblistingRouter;
