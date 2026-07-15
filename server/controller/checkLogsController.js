const appointmentModel = require("../model/appointmentModel");
const checkLogsModel = require("../model/checkLogsModel");
const passModel = require("../model/passModel");
const { sendMail } = require("../utils/mailer");
const { findValidPass } = require("./passController");


exports.CheckIn = async (req, res) => {

    const { qrToken, gateId } = req.body;
    try {
        const { pass, status, err } = await findValidPass(qrToken);

        if (err) {
            return res.status(status).json({ message: err});
        }

        if (pass.status !== "issued") {
            return res.status(409).json({ message: `Cannot check in — pass is currently "${pass.status}"` });
        }

        pass.status = "checked-in";
        await pass.save();

        const log = await checkLogsModel.create({
            pass: pass._id,
            checkInTime: Date.now(),
            gateId: gateId || "main-gate",
            scannedBy: req.user._id,

        });
        const host = pass.appointment.host ;

        if(host && host.email){
            
            sendMail(
            host.email, // to
            "Your visitor has arrived", // subject
            `<p>${pass.visitor.name} has just checked in to see you.</p>
            <p>Purpose: ${pass.appointment.purpose}</p>`

            )
            .catch(err => console.log("Check-in email failed (non-fatal):", err.message))

        }
    
        res.status(201).json({ message: "Checked in successfully", log, pass });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

exports.CheckOut = async (req, res) => {
    const { qrToken } = req.body

    try {

        const pass = await passModel.findOne({ qrToken: qrToken });

        if (!pass) {
            return res.status(404).json({ message: "pass not found" })
        }
        if (pass.status !== "checked-in") {
            return res.status(400).json({ message: "This visitor is not currently checked in" })
        }

        const log = await checkLogsModel.findOne({ pass: pass._id }).sort({ createdAt: -1 })
        if (!log || log.checkOutTime) {
            return res.status(400).json({ message: "No active check-in record found for this pass" });
        }
        log.checkOutTime = Date.now();
        await log.save();

        pass.status = "checked-out"
        await pass.save();

        await appointmentModel.findByIdAndUpdate(pass.appointment, { status: "completed" });

        res.status(201).json({ message: "Checked out successfully", log, pass });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


exports.getLogs = async (req, res) => {
    try {
        const { gateId } = req.query;
        const filter = {};
        if (gateId) filter.gateId = gateId;

        const logs = await checkLogsModel.find(filter)
            .populate({ path: "pass", populate: { path: "visitor" } })
            .populate("scannedBy", "name")
            .sort({ createdAt: -1 })
            .limit(200);

        res.status(200).json(logs);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};






