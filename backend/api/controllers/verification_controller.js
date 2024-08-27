const { json } = require("body-parser");
const knex = require("../models/connection_db");
const nodemailer = require("nodemailer");

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
        ? row.profile_picture.toString("base64")
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
        user: "livcenteno24@gmail.com",
        pass: "glwg czmw tmdb rzvn",
      },
    });

    const mailOptions = {
      from: "livcenteno24@gmail.com",
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

    await knex("company").where({ id }).del();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "livcenteno24@gmail.com",
        pass: "glwg czmw tmdb rzvn",
      },
    });

    const mailOptions = {
      from: "livcenteno24@gmail.com",
      to: company.email,
      subject: "UNABLE TO VERIFY COMPANY",
      text: `Dear User,\n\nYour request to verify your company has been declined. Ensure the company is legitimate and all data entered is correct. The company can request verification again by re-registering.\n\nSincerely Yours,\nPWDKA TEAM`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      successful: true,
      message: "Successfully Deleted Company",
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
        user: "livcenteno24@gmail.com",
        pass: "glwg czmw tmdb rzvn",
      },
    });

    const mailOptions = {
      from: "livcenteno24@gmail.com",
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

    await knex("user").where({ id }).del();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: "livcenteno24@gmail.com",
        pass: "glwg czmw tmdb rzvn",
      },
    });

    const mailOptions = {
      from: "livcenteno24@gmail.com",
      to: user.email,
      subject: "UNABLE TO VERIFY USER",
      text: `Dear User,\n\nYour request to verify your account has been declined. Ensure all data entered is correct. You can request verification again by re-registering.\n\nSincerely Yours,\nPWDKA TEAM`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      successful: true,
      message: "Successfully Deleted User",
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
