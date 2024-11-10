const express = require("express");
const loginController = require("../controllers/login_controller");
const loginRouter = express.Router();

loginRouter.post("/auth", loginController.login); // Login Admin
loginRouter.get("/verify/token", loginController.verifyToken); // Verify Token

module.exports = loginRouter;
