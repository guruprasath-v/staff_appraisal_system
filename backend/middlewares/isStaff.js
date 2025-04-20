const isStaff = (req, res, next) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Staff privileges required.",
    });
  }
  next();
};

module.exports = { isStaff };
