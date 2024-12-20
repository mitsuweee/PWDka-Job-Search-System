const knex = require("../models/connection_db");

const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
  const token = req.params.token;
  if (!token) {
    return res.status(403).json({
      successful: false,
      message: "No token provided",
    });
  }

  console.log("Token received for verification:", token);

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err.message);
      return res.status(401).json({
        successful: false,
        message: "Unauthorized! Invalid or expired token",
      });
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
  verifyToken,
  retrievedRefreshToken,
};

// const knex = require("../models/connection_db");
// const jwt = require("jsonwebtoken");
// const SECRET_KEY = process.env.SECRET_KEY;

// const verifyToken = (req, res, next) => {
//   const token = req.params.token;
//   if (!token) {
//     return res.status(403).json({
//       successful: false,
//       message: "No token provided",
//     });
//   }

//   console.log("Token received for verification:", token);

//   jwt.verify(token, SECRET_KEY, (err, decoded) => {
//     if (err) {
//       console.error("Token verification error:", err.message);
//       return res.status(401).json({
//         successful: false,
//         message: "Unauthorized! Invalid or expired token",
//       });
//     }

//     console.log("Token is valid. Decoded data:", decoded);

//     req.userId = decoded.id;
//     req.userRole = decoded.role;
//     next();
//   });
// };

// const retrievedRefreshToken = (req, res) => {
//   const { userId, userRole } = req.body;

//   if (!userId || !userRole) {
//     return res.status(400).json({
//       successful: false,
//       message: "Missing user ID or role",
//     });
//   }

//   // Validate user role to get the appropriate table and ID field
//   let tokenTable;
//   let idField;

//   if (userRole === "user") {
//     tokenTable = "user_token";
//     idField = "user_id";
//   } else if (userRole === "company") {
//     tokenTable = "company_token";
//     idField = "company_id";
//   } else if (userRole === "admin") {
//     tokenTable = "admin_token";
//     idField = "admin_id";
//   } else {
//     return res.status(400).json({
//       successful: false,
//       message: "Invalid role provided",
//     });
//   }

//   // Fetch token and expiration date based on user role and ID field
//   knex(tokenTable)
//     .where({ [idField]: userId }) // Query based on dynamic field name
//     .first()
//     .then((tokenRecord) => {
//       if (!tokenRecord || !tokenRecord.refresh_token) {
//         return res.status(404).json({
//           successful: false,
//           message: `No refresh token found for the user in the ${userRole} table`,
//         });
//       }

//       const currentDate = new Date();
//       const tokenExpirationDate = new Date(tokenRecord.token_expiration);

//       if (currentDate > tokenExpirationDate) {
//         return res.status(400).json({
//           successful: false,
//           message: "Invalid refresh token, token has expired",
//         });
//       }

//       console.log(
//         `Refresh token for user (${userRole}):`,
//         tokenRecord.refresh_token
//       );

//       return res.status(200).json({
//         successful: true,
//         message: "Refresh token retrieved successfully",
//         refresh_token: tokenRecord.refresh_token,
//       });
//     })
//     .catch((err) => {
//       return res.status(500).json({
//         successful: false,
//         message: err.message,
//       });
//     });
// };

// module.exports = {
//   verifyToken,
//   retrievedRefreshToken,
// };
