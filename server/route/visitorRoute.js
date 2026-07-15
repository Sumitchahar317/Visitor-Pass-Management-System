const express = require("express");

const router = express.Router();

// importing functions from controller directory  
const { createVisitor, getVisitors, getVisitorById, updateVisitor } = require("../controller/visitorController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const upload = require("../middleware/upload");


// creating a new visitor
router.post("/", authenticate, upload.single("photo"), createVisitor);


// showing all visitor - list of all visitor
router.get("/", authenticate, getVisitors);

// updating an visitor info (includes upload.single middleware to support photo update/replacement)
router.put("/:id", authenticate, upload.single("photo"), updateVisitor );

// getting info of any perticular visitor
router.get("/:id", authenticate, getVisitorById);

module.exports = router;