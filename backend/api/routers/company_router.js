const express = require ('express')
const companyController = require('../controllers/company_controller')
const companyRouter = express.Router()


companyRouter.post('/register', companyController.registerCompany) //Register Company

companyRouter.post('/login', companyController.loginCompany) // Login Company

companyRouter.get('/view/:id', companyController.viewCompanyViaId) // Search Company ID


companyRouter.put('/update/:id', companyController.updateCompany)// Update Company Details

companyRouter.put('/update/password/:id', companyController.companyChangePassword)// Change Company Password




module.exports = companyRouter