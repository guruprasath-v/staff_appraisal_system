const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const auth = async (req, res, next) => {
  try {
    // Check for token in Authorization header
    let token = req.headers.authorization?.split(" ")[1];

    // If no token in header, check cookies
    if (!token && req.cookies) {
      token = req.cookies.ssid;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

const isAdmin = (req, res, next) => {
  console.log(req.user);
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

module.exports = { auth, isAdmin };
