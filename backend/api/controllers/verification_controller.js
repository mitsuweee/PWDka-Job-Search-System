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
      text: `Dear User,\n\nCongratulations! Your company has been successfully verified. You can now access our platform.\n\nBest regards,\nPWDKA TEAM`,
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
      text: `Dear User,\n\nCongratulations! Your account has been successfully verified. You can now access our platform.\n\nBest regards,\nPWDKA TEAM`,
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

module.exports = {
  verifyCompany,
  verifyUser,
  declineCompany,
  declineUser,
  viewPendingUsers,
  viewPendingCompany,
};
