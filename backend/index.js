require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/staff", require("./routes/staff"));
app.use("/api/dpt", require("./routes/department"));

// Error handling middleware
app.use(errorHandler);

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Staff Appraisal System API" });
});

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
