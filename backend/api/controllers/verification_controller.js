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
        knex.raw(
          "CONCAT(user.first_name, ' ', user.middle_initial, '. ', user.last_name) AS full_name"
        ),
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

    // Convert BLOBs to Base64 strings
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
        "Company.id",
        "Company.name",
        "Company.description",
        "Company.address",
        "Company.city",
        "Company.contact_number",
        "Company.profile_picture",
        "Company.email"
      )
      .where("Company.status", "PENDING");

    // Convert BLOB data to base64
    const processedRows = rows.map((row) => ({
      ...row,
      profile_picture: row.profile_picture
        ? row.profile_picture.toString()
        : null,
    }));

    return res.status(200).json({
      successful: true,
      message: "Successfully Retrieved Companies",
      data: processedRows, // Use processedRows instead of users
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

// Verify company
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

// Decline company
const declineCompany = async (req, res, next) => {
  const id = req.params.id;
  const { reason } = req.body;

  if (!id) {
    return res.status(404).json({
      successful: false,
      message: "ID is missing",
    });
  }

  if (!reason) {
    return res.status(400).json({
      successful: false,
      message: "Decline reason is required",
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
      text: `Dear User,\n\nYour request to verify your company has been declined for the following reason: ${reason}.\n\nEnsure the company is legitimate and all data entered is correct. You can request verification again by re-registering.\n\nSincerely Yours,\nPWDKA TEAM`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      successful: true,
      message: "Successfully deleted company and sent decline email",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

// Verify user
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

// Decline user
const declineUser = async (req, res, next) => {
  const id = req.params.id;
  const { reason } = req.body; // Get the reason from the request body

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

    // Delete the user
    await knex("user").where({ id }).del();

    // Set up email transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email options with the reason included
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "UNABLE TO VERIFY USER",
      text: `Dear User,\n\nYour request to verify your account has been declined for the following reason:\n\n"${reason}"\n\nEnsure all data entered is correct. You can request verification again by re-registering.\n\nSincerely Yours,\nPWDKA TEAM`,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      successful: true,
      message: "Successfully Declined User and Sent Email",
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
