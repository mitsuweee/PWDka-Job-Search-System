const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authMiddlewareRouter = express.Router();

authMiddlewareRouter.post("/token/auth", authMiddleware.verifyToken);
authMiddlewareRouter.get("/get/token", authMiddleware.retrievedRefreshToken);

module.exports = authMiddlewareRouter;
