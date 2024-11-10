const express = require("express");
const userController = require("../controllers/user_controller");
const userRouter = express.Router();

userRouter.post("/register", userController.registerUser); // Register Account for users

userRouter.post("/login", userController.loginUser); //Login For Users

userRouter.get("/view/:id", userController.viewUserViaId); //View users via id

userRouter.get("/view/verify/status/:id", userController.verifyUserStatus); //View users via id

userRouter.put("/update/:id", userController.updateUser); //Update User Details
userRouter.put("/update/email/:id", userController.updateUserEmail); //Update User email

userRouter.put("/update/picture/:id", userController.updateUserProfilePicture); //Update User Profle Picture

userRouter.put("/update/password/:id", userController.userChangePassword); // Change User Password

userRouter.put("/update/deactivate/:id", userController.deactivateUser); // Deactivate User

module.exports = userRouter;
