const { json } = require("body-parser");
const knex = require("../models/connection_db");
const bcrypt = require("bcrypt");

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
    // Query only the user and company tables
    const tables = ["user", "company"];
    let storedPassword, role, status, id;

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
    if (status === "PENDING") {
      return res.status(400).json({
        successful: false,
        message: `${
          role.charAt(0).toUpperCase() + role.slice(1)
        }'s Account is under Verification. Please wait for the email confirmation.`,
      });
    }

    // Successful login response
    return res.status(200).json({
      successful: true,
      role: role,
      id: id,
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
};

module.exports = {
  login,
};
