const express = require("express");
const verificationController = require("../controllers/verification_controller");
const verificationRouter = express.Router();

verificationRouter.get("/view/users", verificationController.viewPendingUsers); //VIEW ALL PENDING USERS
verificationRouter.get(
  "/view/companies",
  verificationController.viewPendingCompany
); //VIEW ALL PENDING USERS

verificationRouter.put("/company/:id", verificationController.verifyCompany); // Verify Company
verificationRouter.delete(
  "/company/:id",
  verificationController.declineCompany
); //Decline Company Registration

verificationRouter.put("/user/:id", verificationController.verifyUser); // Verify User
verificationRouter.delete("/user/:id", verificationController.declineUser); // Decline user registration

module.exports = verificationRouter;
