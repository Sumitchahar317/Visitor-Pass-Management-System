const express = require("express");
const router = express.Router();

// importing different modules 
const { createInvite, getByInviteToken, completeRegistration, createWalkIn, 
approveAppointment, rejectAppointment, 
getAppointmentById,
getAppointments} = require("../controller/appointmentController");

const { authenticate, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");


//invite created by emp/admin for new visitor 
router.post("/invite", 
    authenticate, authorize("employee","admin"), 
    createInvite
);


//This is the endpoint a visitor would use when they click their (host) invite
router.get("/invite/:inviteToken", getByInviteToken);

// user self registeration endpoint after invite from host
router.put("/invite/:inviteToken/complete", upload.single("photo"), 
completeRegistration
);

// when vistor directly came to office for visit (walk-in)
router.post("/walkin", authenticate, authorize("security","admin",), 
upload.single("photo"), createWalkIn
);

// accept (approve) the appointment by admin or the employee who created thic appointment
router.put("/:id/approve", authenticate, authorize("employee","admin"), approveAppointment);

// reject the appointment
router.put("/:id/reject", authenticate, authorize("employee","admin"), rejectAppointment);

//fetch a list of appointments
router.get("/", authenticate, getAppointments);

// by id (appointment._id) 
router.get("/:id", authenticate, getAppointmentById);

module.exports = router