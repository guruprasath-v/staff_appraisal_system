const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Subtask = require("../models/subtaskModel");

const getRankings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const rankings = await User.getRankings(page, limit);

    res.status(200).json({
      success: true,
      data: rankings,
    });
  } catch (error) {
    next(error);
  }
};

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

const getAssignedSubtasks = async (req, res, next) => {
  try {
    const staffId = req.user.id;
    const subtasks = await Subtask.getByStaffId(staffId);

    res.status(200).json({
      success: true,
      data: subtasks,
    });
  } catch (error) {
    next(error);
  }
};

const updateSubtaskStatus = async (req, res, next) => {
  try {
    const { stid } = req.params;
    await Subtask.updateToReviewStatus(stid);

    res.status(200).json({
      success: true,
      message: "Subtask status updated to review",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStaff,
  getAssignedSubtasks,
  updateSubtaskStatus,
  getRankings,
};
