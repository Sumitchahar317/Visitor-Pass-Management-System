const express = require("express");
const router = express.Router();

const { getDashboardStats } = require("../controller/dashboardController");
const { authenticate, authorize } = require("../middleware/authMiddleware");


router.get("/stats", authenticate, authorize("admin"), getDashboardStats);

module.exports = router;



