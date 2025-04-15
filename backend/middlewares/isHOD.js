const isHOD = (req, res, next) => {
  try {
    // Check if user exists and is a HOD
    if (!req.user || req.user.role !== "HOD") {
      return res.status(403).json({
        success: false,
        message: "Access denied. HOD privileges required.",
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = isHOD;
