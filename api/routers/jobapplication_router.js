const express = require ('express')
const jobApplicationController = require('../controllers/jobapplication_controller')
const jobApplicationRouter = express.Router()


jobApplicationRouter.post('/upload/resume', jobApplicationController.uploadResume) //Upload Resume

jobApplicationRouter.get('/applications/:id', jobApplicationController.viewAllUsersApplicationsViaCompanyId) // View All APPLICATION VIA COMPANY ID



module.exports = jobApplicationRouter
