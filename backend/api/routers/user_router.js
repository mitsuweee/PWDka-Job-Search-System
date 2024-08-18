const express = require('express')
const userController = require('../controllers/user_controller')
const userRouter = express.Router()


userRouter.post('/register', userController.registerUser) // Register Account for users

userRouter.post('/login', userController.loginUser) //Login For Users

userRouter.get('/view/:id', userController.viewUserViaId) //View users via id

userRouter.put('/update/:id', userController.updateUser) //Update User Details

userRouter.put('/update/password/:id', userController.userChangePassword) // Change User Password

module.exports = userRouter