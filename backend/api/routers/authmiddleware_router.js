const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authMiddlewareRouter = express.Router();

authMiddlewareRouter.get("/auth/token/:token", authMiddleware.verifyToken);
module.exports = authMiddlewareRouter;
