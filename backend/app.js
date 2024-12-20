const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");

require("./cron");

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

// const database = require("./api/models/connection_db");
// database.connectDatabase();

app.use(express.static(path.join(__dirname, "../frontend/dist")));

const adminRouter = require("./api/routers/admin_router");
const companyRouter = require("./api/routers/company_router");
const verificationRouter = require("./api/routers/verification_router");
const userRouter = require("./api/routers/user_router");
const jobListingRouter = require("./api/routers/joblisting_router");
const jobApplicationRouter = require("./api/routers/jobapplication_router");
const loginRouter = require("./api/routers/login_router");
const passwordRouter = require("./api/routers/password_router");
const authMiddlewareRouter = require("./api/routers/authmiddleware_router");

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// HEADER SETTINGS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "*");
    return res.status(200).json({});
  }

  next();
});

app.use("/admin", adminRouter);
app.use("/login", loginRouter);
app.use("/company", companyRouter);
app.use("/verification", verificationRouter);
app.use("/user", userRouter);
app.use("/joblisting", jobListingRouter);
app.use("/jobapplication", jobApplicationRouter);
app.use("/password", passwordRouter);
app.use("/authmiddleware", authMiddlewareRouter);

// Fallback route for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

// ERROR MIDDLEWARE
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
