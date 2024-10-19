const { json } = require("body-parser");
const knex = require("../models/connection_db");
const crypto = require("crypto"); // To generate a unique reset token
const util = require("./util");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

const emailForgotPassword = async (req, res, next) => {
  let email = req.body.email;

  if (!email) {
    return res.status(400).json({
      successful: false,
      message: "Email is missing",
    });
  } else {
    try {
      // Check if the email exists in the 'user' or 'company' table
      const user =
        (await knex("user").where({ email }).first()) ||
        (await knex("company").where({ email }).first());

      if (!user) {
        return res.status(400).json({
          successful: false,
          message: "Email not found in our records",
        });
      }

      // Generate a unique token for password reset
      const resetToken = crypto.randomBytes(20).toString("hex");
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour from now

      // Update user record with reset token and expiration time
      await knex(user.role).where({ email }).update({
        reset_password_token: resetToken,
        reset_password_expires: resetExpires,
      });

      // Prepare the reset password URL
      const resetUrl = `/passwordconfirmed?token=${resetToken}`;

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      // Send the reset password email
      const mailOptions = {
        to: email,
        from: process.env.EMAIL_USER,
        subject: "Password Reset Request",
        text: `You are receiving this email because you have requested a password reset for your account.\n\n
Please click on the following link, or paste it into your browser to complete the process:\n\n
${resetUrl}\n\n
If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      };

      await transporter.sendMail(mailOptions);

      return res.status(200).json({
        successful: true,
        message: "A password reset link has been sent to your email address.",
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const resetPassword = async (req, res, next) => {
  const { token, new_password, confirm_password } = req.body;

  if (!token || !new_password || !confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "One or more details are missing",
    });
  }

  if (new_password !== confirm_password) {
    return res.status(400).json({
      successful: false,
      message: "Passwords do not match",
    });
  }

  if (!util.checkPassword(new_password)) {
    return res.status(400).json({
      successful: false,
      message:
        "Invalid Password Format. It should have at least one digit, one uppercase, one lowercase, one special character, and be at least 8 characters in length.",
    });
  }

  try {
    // Find user by reset token and check if token is still valid
    const user =
      (await knex("user")
        .where({ reset_password_token: token })
        .andWhere("reset_password_expires", ">", new Date())
        .first()) ||
      (await knex("company")
        .where({ reset_password_token: token })
        .andWhere("reset_password_expires", ">", new Date())
        .first());

    if (!user) {
      return res.status(400).json({
        successful: false,
        message: "Invalid or expired token.",
      });
    }

    // Compare the new password with the current password
    const isSamePassword = await bcrypt.compare(new_password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        successful: false,
        message: "New Password can't be the same as the old one.",
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update the user's password, clear the reset token and expiration
    await knex(user.role).where({ id: user.id }).update({
      password: hashedPassword,
      reset_password_token: null, // Clearing the reset token
      reset_password_expires: null, // Clearing the expiration
    });

    return res.status(200).json({
      successful: true,
      message: "Your password has been successfully reset.",
    });
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

module.exports = {
  emailForgotPassword,
  resetPassword,
};
