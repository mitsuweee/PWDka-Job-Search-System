const express = require ('express')
const jobListingController = require('../controllers/joblisting_controller')
const joblistingRouter = express.Router()


joblistingRouter.post('/post/job', jobListingController.postJobs)
joblistingRouter.get('/view/:id', jobListingController.viewJobListing) // View Job Listing
joblistingRouter.get('/view/newesttooldest/:id', jobListingController.viewJobListingViaUserNewestToOldest) // View Job listing via User ID Newest to oldest
joblistingRouter.get('/view/oldesttonewest/:id', jobListingController.viewJobListingViaUserOldestToNewest) // View Job listing via User ID Oldest to newest
joblistingRouter.get('/view/newesttooldest/company/:id', jobListingController.viewJobsCreatedByCompanyNewestToOldest) // View Job Listing Via Company ID Newest To OLDEST
joblistingRouter.get('/view/oldesttonewest/company/:id', jobListingController.viewJobsCreatedByCompanyOldestToNewest) // View Job Listing Via Company ID Oldest To Newest

joblistingRouter.put('/update/:id', jobListingController.updateJobListing) //Update Job Listing
joblistingRouter.delete('/delete/:id', jobListingController.deleteJob) // Delete Job Listing


module.exports = joblistingRouter