const { json } = require("body-parser");
const knex = require("../models/connection_db");
const bcrypt = require("bcrypt");

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Generate a 256-bit (32-byte) secret key, encoded in hexadecimal
const SECRET_KEY = crypto.randomBytes(32).toString("hex");

const login = async (req, res, next) => {
  const email = req.body.email.toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).json({
      successful: false,
      message: "Email or Password is missing",
    });
  } else {
    try {
      // Query only the user, company, and admin tables
      const tables = ["user", "company"];
      let storedPassword, role, status, id;

      // Check user and company tables
      for (let table of tables) {
        const rows = await knex(table)
          .select("id", "email", "password", "role", "status")
          .where({ email })
          .first();

        if (rows) {
          id = rows.id;
          storedPassword = rows.password;
          role = rows.role;
          status = rows.status;
          break;
        }
      }

      // If no match found, check the admin table separately (no status field for admin)
      if (!storedPassword) {
        const admin = await knex("admin")
          .select("id", "email", "password", "role")
          .where({ email })
          .first();

        if (admin) {
          id = admin.id;
          storedPassword = admin.password;
          role = admin.role;
        }
      }

      if (!storedPassword) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      }

      // Verify the password
      const passwordMatch = await bcrypt.compare(password, storedPassword);

      if (!passwordMatch) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      }

      // Check status for user and company roles
      if (status === "PENDING" && role !== "admin") {
        return res.status(400).json({
          successful: false,
          message: `${
            role.charAt(0).toUpperCase() + role.slice(1)
          }'s Account is under Verification. Please wait for the email confirmation.`,
        });
      }

      // Generate a JWT token with a 2-hour expiration
      const token = jwt.sign(
        { id, role }, // Payload with user ID and role
        SECRET_KEY, // Secret key to sign the token
        { expiresIn: "2h" } // Token expiration time
      );

      // Successful login response with token
      return res.status(200).json({
        successful: true,
        role: role,
        id: id,
        token: token, // Include the token in the response
        message: `Successfully Logged In as ${
          role.charAt(0).toUpperCase() + role.slice(1)
        }.`,
      });
    } catch (err) {
      return res.status(500).json({
        successful: false,
        message: err.message,
      });
    }
  }
};

module.exports = {
  login,
};
