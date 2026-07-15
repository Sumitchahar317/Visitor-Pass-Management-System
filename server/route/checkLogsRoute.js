const express = require("express");

const { CheckIn, CheckOut, getLogs } = require("../controller/checkLogsController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/checkin", authenticate, authorize("admin","security"), CheckIn);

router.post("/checkout", authenticate, authorize("admin","security"), CheckOut);

// to access all logs 
router.get("/", authenticate, authorize("admin","security"), getLogs)


module.exports = router;