const { json } = require("body-parser");
const knex = require("../models/connection_db");
const crypto = require("crypto");
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
      // Check if the email exists
      const user =
        (await knex("user").where({ email }).first()) ||
        (await knex("admin").where({ email }).first()) ||
        (await knex("company").where({ email }).first());

      if (!user) {
        return res.status(400).json({
          successful: false,
          message: "Email not found in our records",
        });
      } else {
        // Generate a unique token for password reset
        const resetToken = crypto.randomBytes(20).toString("hex");
        const resetExpires = new Date(Date.now() + 3600000);

        await knex(user.role).where({ email }).update({
          reset_password_token: resetToken,
          reset_password_expires: resetExpires,
        });

        const resetUrl = `pwdka.com.ph/passwordconfirmed?token=${resetToken}`;

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
      }
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

const resetPassword = async (req, res, next) => {
  let token = req.body.token;
  let new_password = req.body.new_password;
  let confirm_password = req.body.confirm_password;

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
    // Find  the user by their reset token and check if their token is still valid
    const user =
      (await knex("user")
        .where({ reset_password_token: token })
        .andWhere("reset_password_expires", ">", new Date())
        .first()) ||
      (await knex("admin")
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

    const isSamePassword = await bcrypt.compare(new_password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        successful: false,
        message: "New Password can't be the same as the old one.",
      });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await knex(user.role).where({ id: user.id }).update({
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
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
