const { json } = require("body-parser");
const knex = require("../models/connection_db");
const nodemailer = require("nodemailer");
require("dotenv").config();

const viewPendingUsers = async (req, res, next) => {
  try {
    const rows = await knex("user")
      .join("disability", "user.disability_id", "disability.id")
      .select(
        "user.id",
        "disability.type",
        "user.first_name",
        "user.middle_initial",
        "user.last_name",
        "user.email",
        "user.address",
        "user.city",
        "user.gender",
        "user.birth_date",
        "user.contact_number",
        "user.formal_picture",
        "user.picture_with_id",
        "user.picture_of_pwd_id"
      )
      .where("user.status", "PENDING");

    // Convert BLOBs to  string
    const users = rows.map((user) => ({
      ...user,
      formal_picture: user.formal_picture
        ? user.formal_picture.toString()
        : null,
      picture_with_id: user.picture_with_id
        ? user.picture_with_id.toString()
        : null,
      picture_of_pwd_id: user.picture_of_pwd_id
        ? user.picture_of_pwd_id.toString()
        : null,
    }));

    // Emit real-time event using Socket.io
    global.io.emit("pendingUsersRetrieved", { users });

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Users",
      data: users,
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const viewPendingCompany = async (req, res, next) => {
  try {
    const rows = await knex("company")
      .select(
        "company.id",
        "company.name",
        "company.description",
        "company.address",
        "company.city",
        "company.contact_number",
        "company.profile_picture",
        "company.email"
      )
      .where("company.status", "PENDING");

    // Convert BLOB data to String
    const processedRows = rows.map((row) => ({
      ...row,
      profile_picture: row.profile_picture
        ? row.profile_picture.toString()
        : null,
    }));

    // Emit real-time event using Socket.io
    global.io.emit("pendingCompaniesRetrieved", { companies: processedRows });

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Companies",
      data: processedRows,
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const verifyCompany = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  }

  try {
    const company = await knex("company").select("email").where({ id }).first();

    if (!company) {
      return res.status(404).json({
        successful: false,
        message: "Company not found",
      });
    }

    await knex("company").where({ id }).update({ status: "VERIFIED" });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: company.email,
      subject: "ACCOUNT VERIFIED!",
      text: `Dear User,\n\nCongratulations! Your company has been successfully verified. You can now access our platform.\n\nIf you have any inquiries, feel free to email us at pwdkateam@gmail.com.\n\nBest regards,\nPWDKA TEAM`,
    };

    await transporter.sendMail(mailOptions);

    // Emit real-time event using Socket.io
    global.io.emit("companyVerified", { id, status: "VERIFIED" });

    return res.status(200).json({
      successful: true,
      message: "Successfully Verified Company!",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const declineCompany = async (req, res, next) => {
  const id = req.params.id;
  const { reason } = req.body; // Retrieve the decline reason from the request body

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  }

  if (!reason) {
    return res.status(400).json({
      successful: false,
      message: "Reason for declining is required",
    });
  }

  try {
    const company = await knex("company").select("email").where({ id }).first();

    if (!company) {
      return res.status(404).json({
        successful: false,
        message: "Company not found",
      });
    }

    await knex("company").where({ id }).del();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: company.email,
      subject: "UNABLE TO VERIFY COMPANY",
      text: `Dear User,

Your request to verify your company has been declined for the following reason:

"${reason}"

Please ensure the company is legitimate and all data entered is correct. You can request verification again by re-registering.

If you have any inquiries, feel free to email us at pwdkateam@gmail.com.


Sincerely Yours,
PWDKA TEAM`,
    };

    await transporter.sendMail(mailOptions);
    // Emit a real-time notification using Socket.IO
    if (global.io) {
      global.io.emit("company_declined", {
        id,
        email: company.email,
        reason,
        message: "Company verification has been declined",
      });
    }

    return res.status(200).json({
      successful: true,
      message: "Successfully Deleted Company and sent notification email",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const verifyUser = async (req, res, next) => {
  const id = req.params.id;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  }

  try {
    const user = await knex("user").select("email").where({ id }).first();

    if (!user) {
      return res.status(404).json({
        successful: false,
        message: "User not found",
      });
    }

    await knex("user").where({ id }).update({ status: "VERIFIED" });

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "ACCOUNT VERIFIED!",
      text: `Dear User,\n\nCongratulations! Your account has been successfully verified. You can now access our platform.\n\nIf you have any inquiries, feel free to email us at pwdkateam@gmail.com.\n\nBest regards,\nPWDKA TEAM`,
    };

    await transporter.sendMail(mailOptions);

    // Emit real-time event using Socket.io
    global.io.emit("userVerified", { id, status: "VERIFIED" });

    return res.status(200).json({
      successful: true,
      message: "Successfully Verified User!",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const declineUser = async (req, res, next) => {
  const id = req.params.id;
  const { reason } = req.body; // Retrieve the decline reason from the request body

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  }

  if (!reason) {
    return res.status(400).json({
      successful: false,
      message: "Reason for declining is required",
    });
  }

  try {
    const user = await knex("user").select("email").where({ id }).first();

    if (!user) {
      return res.status(404).json({
        successful: false,
        message: "User not found",
      });
    }

    await knex("user").where({ id }).del();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "UNABLE TO VERIFY USER",
      text: `Dear User,

Your request to verify your account has been declined for the following reason:

"${reason}"

Please ensure that all data entered is correct. You can request verification again by re-registering.

If you have any inquiries, feel free to email us at pwdkateam@gmail.com.

Sincerely Yours,
PWDKA TEAM`,
    };

    await transporter.sendMail(mailOptions);

    // Emit a real-time notification using Socket.IO
    if (global.io) {
      global.io.emit("user_declined", {
        id,
        email: user.email,
        reason,
        message: "User verification has been declined",
      });
    }

    return res.status(200).json({
      successful: true,
      message: "Successfully Deleted User and sent notification email",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.body.token;
  const { userId, userRole } = req.body;

  try {
    if (!token) {
      return res.status(403).json({
        successful: false,
        message: "No token provided",
      });
    }

    console.log("Token received for verification:", token);

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
      if (err) {
        if (err.name === "TokenExpiredError") {
          console.error("Token has expired:", err.message);
          //Token has expired
          try {
            if (!userId || !userRole) {
              return res.status(400).json({
                successful: false,
                message: "Missing user ID or role",
              });
            }

            // Convert userId to string to ensure consistency in querying
            const userIdStr = userId.toString();

            // Validate the user role and get the correct table name and field for ID
            let tokenTable;
            let idField;

            if (userRole === "user") {
              tokenTable = "user_token";
              idField = "user_id"; // Field for user token table
            } else if (userRole === "company") {
              tokenTable = "company_token";
              idField = "company_id"; // Field for company token table
            } else if (userRole === "admin") {
              tokenTable = "admin_token";
              idField = "admin_id"; // Field for admin token table
            } else {
              return res.status(400).json({
                successful: false,
                message: "Invalid role provided",
              });
            }

            // Check if a token exists in the appropriate table based on the correct ID field
            knex(tokenTable)
              .where({ [idField]: userId }) // Use dynamic field name based on role
              .first()
              .then((tokenRecord) => {
                if (!tokenRecord || !tokenRecord.refresh_token) {
                  return res.status(404).json({
                    successful: false,
                    message: `No refresh token found for the user in the ${userRole} table`,
                  });
                }

                jwt.verify(
                  tokenRecord.refresh_token,
                  SECRET_KEY,
                  (err, decoded) => {
                    if (err) {
                      if (err.name === "TokenExpiredError") {
                        return res.status(400).json({
                          successful: false,
                          message: "Invalid refresh token, token has expired",
                        });
                      }
                    } else {
                      // Log the retrieved refresh token
                      console.log(
                        "Retrieved refresh token:",
                        tokenRecord.refresh_token
                      );
                      // Return the refresh token from the table
                      return res.status(200).json({
                        successful: true,
                        message: "Refresh token retrieved successfully",
                        refresh_token: tokenRecord.refresh_token, // Return the existing refresh token
                      });
                    }
                  }
                );
              });
          } catch (err) {
            return res.status(500).json({
              successful: false,
              message: err.message,
            });
          }
        } else {
          console.error("Token verification error:", err.message);
          return res.status(401).json({
            successful: false,
            message: "Unauthorized! Invalid token",
          });
        }
      } else {
        console.log("Token is valid. Decoded data:", decoded);

        // Setting user info in request object
        req.userId = decoded.id;
        req.userRole = decoded.role;

        // Send response
        return res.status(200).json({
          successful: true,
          message: "Token is valid",
          userId: req.userId, // You can include user data in the response if needed
          userRole: req.userRole,
        });
      }
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

const retrievedRefreshToken = (req, res) => {
  const { userId, userRole } = req.body;

  try {
    if (!userId || !userRole) {
      return res.status(400).json({
        successful: false,
        message: "Missing user ID or role",
      });
    }

    // Convert userId to string to ensure consistency in querying
    const userIdStr = userId.toString();

    // Validate the user role and get the correct table name and field for ID
    let tokenTable;
    let idField;

    if (userRole === "user") {
      tokenTable = "user_token";
      idField = "user_id"; // Field for user token table
    } else if (userRole === "company") {
      tokenTable = "company_token";
      idField = "company_id"; // Field for company token table
    } else if (userRole === "admin") {
      tokenTable = "admin_token";
      idField = "admin_id"; // Field for admin token table
    } else {
      return res.status(400).json({
        successful: false,
        message: "Invalid role provided",
      });
    }

    // Check if a token exists in the appropriate table based on the correct ID field
    knex(tokenTable)
      .where({ [idField]: userId }) // Use dynamic field name based on role
      .first()
      .then((tokenRecord) => {
        if (!tokenRecord || !tokenRecord.refresh_token) {
          return res.status(404).json({
            successful: false,
            message: `No refresh token found for the user in the ${userRole} table`,
          });
        }

        // Get the current date and token expiration date
        const currentDate = new Date(); // Get current date and time
        const tokenExpirationDate = new Date(tokenRecord.token_expiration); // Convert token expiration to Date object

        // Compare current date with the expiration date
        if (currentDate > tokenExpirationDate) {
          return res.status(400).json({
            successful: false,
            message: "Invalid refresh token, token has expired",
          });
        }

        // Log the retrieved refresh token
        console.log("Retrieved refresh token:", tokenRecord.refresh_token);

        // Return the refresh token from the table
        return res.status(200).json({
          successful: true,
          message: "Refresh token retrieved successfully",
          refresh_token: tokenRecord.refresh_token, // Return the existing refresh token
        });
      });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

module.exports = {
  verifyCompany,
  verifyUser,
  declineCompany,
  declineUser,
  viewPendingUsers,
  viewPendingCompany,
  verifyToken,
};
