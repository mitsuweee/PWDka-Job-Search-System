const express = require ('express')
const loginController = require('../controllers/login_controller')
const loginRouter = express.Router()


loginRouter.post('/auth', loginController.login) // Login Admin


module.exports = loginRouter