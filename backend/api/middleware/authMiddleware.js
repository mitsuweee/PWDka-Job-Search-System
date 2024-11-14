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
    }

    console.log("Token is valid. Decoded data:", decoded);

    req.userId = decoded.id;
    req.userRole = decoded.role;
    next();
  });
};

module.exports = {
  verifyToken,
};
