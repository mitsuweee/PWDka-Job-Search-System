const express = require("express");
const passwordController = require("../controllers/password_controller");
const passwordRouter = express.Router();

passwordRouter.post(
  "/forgotpassword/email",
  passwordController.emailForgotPassword
); // Forgot Password Emailing

passwordRouter.put("/resetPassword", passwordController.resetPassword); // Forgot Password Emailing

module.exports = passwordRouter;
