const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const registerStaff = async (req, res, next) => {
  try {
    const { name, email, mob, password, role, dpt, workload } = req.body;

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create staff user
    await User.createUser({
      name,
      email,
      mob,
      password: hashedPassword,
      role,
      dpt,
      workload: workload || 0,
    });

    res.status(201).json({
      success: true,
      message: "Staff registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStaff,
};


