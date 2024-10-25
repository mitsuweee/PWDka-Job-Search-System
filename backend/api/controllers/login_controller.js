const { json } = require("body-parser");
const knex = require("../models/connection_db");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const SECRET_KEY = crypto.randomBytes(32).toString("hex");

const login = async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      successful: false,
      message: "Email or Password is missing",
    });
  }

  try {
    const user =
      (await knex("user")
        .select("id", "email", "password", "role", "status")
        .where({ email })
        .first()) ||
      (await knex("admin")
        .select("id", "email", "password", "role")
        .where({ email })
        .first()) ||
      (await knex("company")
        .select("id", "email", "password", "role", "status")
        .where({ email })
        .first());

    if (!user) {
      return res.status(400).json({
        successful: false,
        message: "Invalid Credentials",
      });
    } else {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      } else {
        if (user.status === "PENDING" && user.role !== "admin") {
          return res.status(400).json({
            successful: false,
            message: `Account is under verification. Please wait for email confirmation.`,
          });
        } else {
          const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
            expiresIn: "2h",
          });

          return res.status(200).json({
            successful: true,
            role: user.role,
            id: user.id,
            token: token,
            message: `Successfully Logged In as ${
              user.role.charAt(0).toUpperCase() + user.role.slice(1)
            }.`,
          });
        }
      }
    }
  } catch (err) {
    return res.status(500).json({
      successful: false,
      message: err.message,
    });
  }
};

module.exports = {
  login,
};
