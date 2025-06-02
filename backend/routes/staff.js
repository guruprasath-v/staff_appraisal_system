const express = require("express");
const router = express.Router();
const {
  registerStaff,
  getAssignedSubtasks,
  updateSubtaskStatus,
  getRankings,
  generateStaffReport,
} = require("../controllers/staffController");
const { auth, isAdmin } = require("../middlewares/auth");
const { isStaff } = require("../middlewares/isStaff");
const isHOD = require("../middlewares/isHOD");
const { testEmailService } = require('../utils/emailService');

// Protected routes (Admin only for rankings, HOD for user creation)
router.post("/register", auth, isHOD, registerStaff);
router.get("/rankings", auth, isAdmin, getRankings);

// Protected routes (Staff only)
router.get("/stask", auth, isStaff, getAssignedSubtasks);
router.put("/stask/:stid", auth, isStaff, updateSubtaskStatus);

// Test email route
router.post('/test-email', auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const result = await testEmailService(email);
    if (result) {
      res.json({ message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ message: 'Failed to send test email' });
    }
  } catch (error) {
    console.error('Error in test email route:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Generate staff report route
router.get("/report/:staffId", auth, isHOD, generateStaffReport);

module.exports = router;
