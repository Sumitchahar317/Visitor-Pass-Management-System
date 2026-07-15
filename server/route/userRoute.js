const express = require("express");
const { register, logIn, getMe, getUsers } = require("../controller/userController");
const { authenticate, authorize } = require("../middleware/authMiddleware");


const router = express.Router();
// signup or register
router.post("/register",authenticate,  authorize("admin"), register);

// login route 
router.post("/login",logIn);


// Get all employee 
router.get("/", authenticate, authorize("admin", "security"), getUsers);

// test route 
router.get("/me", authenticate, getMe);


module.exports = router;