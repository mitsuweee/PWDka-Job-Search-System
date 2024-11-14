const { json } = require("body-parser");
const knex = require("../models/connection_db");
const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

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
      // Retrieve user from one of the tables
      const user =
        (await knex("user")
          .select("id", "email", "password", "role", "status")
          .where({ email })
          .first()) ||
        (await knex("admin")
          .select("id", "email", "password", "role", "status")
          .where({ email })
          .first()) ||
        (await knex("company")
          .select("id", "email", "password", "role", "status")
          .where({ email })
          .first());

      // If no user is found
      if (!user) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      }

      // Check if the password matches
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(400).json({
          successful: false,
          message: "Invalid Credentials",
        });
      } else if (user.status == "DEACTIVATE") {
        return res.status(400).json({
          successful: false,
          message: "Account Does Not Exist",
        });
      } else if (user.status === "PENDING" && user.role !== "admin") {
        return res.status(400).json({
          successful: false,
          message: `Account is under verification. Please wait for email confirmation.`,
        });
      } else {
        // Generate a JWT token
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
          expiresIn: "20s", // Token expiration time (2 hours)
        });

        // Generate a JWT Refresh token
        const refreshToken = jwt.sign(
          { id: user.id, role: user.role },
          SECRET_KEY,
          {
            expiresIn: "40s", // Refresh Token expiration time (1 week)
          }
        );

        // Determine the table and field to store the refresh token
        const tokenTable = `${user.role}_token`;

        // Check if the refresh token already exists for the user
        const existingToken = await knex(tokenTable)
          .where({ [`${user.role}_id`]: user.id })
          .first();

        const tokenExpiration = new Date();
        tokenExpiration.setDate(tokenExpiration.getDate() + 7); // Set expiration to 1 week

        if (existingToken) {
          // If the existing token's expiration has passed, update the token
          if (new Date(existingToken.token_expiration) <= new Date()) {
            // Update the existing token if the expiration date has passed
            await knex(tokenTable)
              .where({ [`${user.role}_id`]: user.id })
              .update({
                refresh_token: refreshToken,
                token_expiration: tokenExpiration,
              });
          }
        } else {
          // If no existing token is found, insert a new one
          await knex(tokenTable).insert({
            [`${user.role}_id`]: user.id, // Store user ID (admin_id, user_id, company_id)
            refresh_token: refreshToken,
            token_expiration: tokenExpiration,
          });
        }

        // Successful login response with both access token and refresh token
        return res.status(200).json({
          successful: true,
          role: user.role,
          id: user.id,
          token: token, // Access token
          refreshToken: refreshToken, // Refresh token
          message: `Successfully Logged In as ${
            user.role.charAt(0).toUpperCase() + user.role.slice(1)
          }.`,
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

// const login = async (req, res, next) => {
//   const email = req.body.email.toLowerCase();
//   const password = req.body.password;

//   if (!email || !password) {
//     return res.status(400).json({
//       successful: false,
//       message: "Email or Password is missing",
//     });
//   } else {
//     try {
//       // Retrieve user from one of the tables
//       const user =
//         (await knex("user")
//           .select("id", "email", "password", "role", "status")
//           .where({ email })
//           .first()) ||
//         (await knex("admin")
//           .select("id", "email", "password", "role", "status")
//           .where({ email })
//           .first()) ||
//         (await knex("company")
//           .select("id", "email", "password", "role", "status")
//           .where({ email })
//           .first());

//       // If no user is found
//       if (!user) {
//         return res.status(400).json({
//           successful: false,
//           message: "Invalid Credentials",
//         });
//       }

//       // Check if the password matches
//       const passwordMatch = await bcrypt.compare(password, user.password);
//       if (!passwordMatch) {
//         return res.status(400).json({
//           successful: false,
//           message: "Invalid Credentials",
//         });
//       } else if (user.status == "DEACTIVATE") {
//         return res.status(400).json({
//           successful: false,
//           message: "Account is DEACTIVATED",
//         });
//       } else if (user.status === "PENDING" && user.role !== "admin") {
//         return res.status(400).json({
//           successful: false,
//           message: `Account is under verification. Please wait for email confirmation.`,
//         });
//       } else {
//         // Generate a JWT token
//         const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, {
//           expiresIn: "2h",
//         });

//         // Save the token in the appropriate table based on the user's role
//         if (user.role === "user") {
//           await knex("user")
//             .where({ id: user.id })
//             .update({ login_token: token });
//         } else if (user.role === "company") {
//           await knex("company")
//             .where({ id: user.id })
//             .update({ login_token: token });
//         } else if (user.role === "admin") {
//           await knex("admin")
//             .where({ id: user.id })
//             .update({ login_token: token });
//         }

//         // Successful login response
//         return res.status(200).json({
//           successful: true,
//           role: user.role,
//           id: user.id,
//           token: token,
//           message: `Successfully Logged In as ${
//             user.role.charAt(0).toUpperCase() + user.role.slice(1)
//           }.`,
//         });
//       }
//     } catch (err) {
//       return res.status(500).json({
//         successful: false,
//         message: err.message,
//       });
//     }
//   }
// };

// const verifyToken = async (req, res, next) => {
//   const id = req.params.id; // Get id from params
//   const token = req.headers["authorization"]; // Get token from headers

//   if (!token) {
//     return res.status(401).json({
//       successful: false,
//       message: "No token provided",
//     });
//   }

//   try {
//     // Verify if the token is valid
//     const decoded = jwt.verify(token, SECRET_KEY);

//     // Check if the token exists in the appropriate table based on the role
//     let user;
//     if (decoded.role === "user") {
//       user = await knex("user")
//         .select("id", "login_token")
//         .where({ id })
//         .first();
//     } else if (decoded.role === "company") {
//       user = await knex("company")
//         .select("id", "login_token")
//         .where({ id })
//         .first();
//     } else if (decoded.role === "admin") {
//       user = await knex("admin")
//         .select("id", "login_token")
//         .where({ id })
//         .first();
//     }

//     // If no user is found or token does not match
//     if (!user || user.login_token !== token) {
//       return res.status(401).json({
//         successful: false,
//         message: "Invalid or expired token",
//       });
//     }

//     // Token is valid
//     return res.status(200).json({
//       successful: true,
//       message: "Token is valid",
//     });
//   } catch (err) {
//     return res.status(500).json({
//       successful: false,
//       message: err.message,
//     });
//   }
// };

module.exports = {
  login,
  // verifyToken,
};
