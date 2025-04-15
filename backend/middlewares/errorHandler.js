const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Handle JWT expiration
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Handle duplicate key errors
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(400).json({
      success: false,
      message: "Duplicate entry found",
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
