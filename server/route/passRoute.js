const express = require("express");
const router = express.Router();

const { issuePass, verifyPass, getPass, getPassPdf } = require("../controller/passController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

//issuing a visitor entry pass
router.post("/issue/:appointmentId", authenticate, authorize("security","employee","admin"), issuePass);

// verify the token provided by visitor
router.get("/verify/:qrToken", authenticate, authorize("security","admin"), verifyPass);

//getpass info 
router.get("/:id", authenticate, authorize("security","employee","admin"), getPass);

// generating pdf of that qr and other detail of pass
router.get("/:id/pdf", authenticate, authorize("security","employee","admin"), getPassPdf);

module.exports = router;