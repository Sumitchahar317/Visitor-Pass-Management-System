const crypto = require("crypto");
const QRCode = require("qrcode");
// Import fs to check if visitor photo exists on disk
const fs = require("fs"); 

const PDFDocument = require("pdfkit");
const path = require("path");

// Importing models for database operations
const passModel = require("../model/passModel");
const appointmentModel = require("../model/appointmentModel");

const generateOrGetPass = async (appointment, issuedByUserId) => {

  const existingPass = await passModel.findOne({ appointment: appointment._id, status: "issued" });
  if (existingPass && existingPass.validTo > new Date()) {
    return existingPass;
  }

  const qrToken = crypto.randomUUID();
  let validFrom, validTo;

  if (appointment.type === "walk-in") {
    validFrom = new Date();
    validTo = new Date(validFrom.getTime() + 8 * 60 * 60 * 1000);
  } else {
    // Anchor validity to the scheduled visit, not the moment of approval.
    validFrom = appointment.scheduledDate ? new Date(appointment.scheduledDate) : new Date();
    validTo = new Date(validFrom.getTime() + 24 * 60 * 60 * 1000); // valid the whole day of the visit
  }

  return passModel.create({
    appointment: appointment._id,
    visitor: appointment.visitor,
    qrToken,
    validFrom,
    validTo,
    issuedBy: issuedByUserId,
  });
};

exports.generateOrGetPass = generateOrGetPass;


//issuing a visitor entry pass
exports.issuePass = async (req, res) => {
    const appointmentId = req.params.appointmentId;
    try {
        const appointment = await appointmentModel.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        // Employees are restricted to only issuing passes for their own hosted appointments.
        // Admins and Security guards can issue passes for any appointment.
        if (req.user.role === "employee" && !appointment.host.equals(req.user._id)) {
            return res.status(403).json({ message: "Only the host or security/admin can issue this pass" });
        }

        if (appointment.status !== "approved") {
            return res.status(400).json({ message: "Appointment must be approved before issuing a pass" });
        }
        
       const pass = await generateOrGetPass(appointment, req.user._id);

        // Convert the QR token into a Base64 Data URL so the frontend can easily display the QR code image
       const qrDataUrl = await QRCode.toDataURL(pass.qrToken);

        res.status(201).json({ pass, qrDataUrl });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// verify the token provided by visitor
exports.verifyPass = async (req, res) => {
  const qrToken = req.params.qrToken;

  try {
    const { pass, err, status } = await findValidPass(qrToken);

    if (err) {
      return res.status(status).json({ valid: false, message: err });
    }

    res.status(200).json({ valid: true, pass });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//getpass 
exports.getPass = async(req,res)=>{
    // id is pass._id
    const id = req.params.id;

    try{
        const pass = await passModel.findById(id)
        .populate("visitor")
        .populate({ path: "appointment", 
        populate: { path: "host", select: "name email" } }
        );

        if(!pass){
            return res.status(404).json({message : "pass not found"})
        }

        if (req.user.role === "employee" && !pass.appointment.host.equals(req.user._id)) {
            return res.status(403).json({ message: "Not authorized to view this pass" });
        }
        
        res.status(200).json(pass);
    }catch(err){
        res.status(400).json({ message : err.message })
    }
}

// generating pdf of that qr and other detail
exports.getPassPdf = async (req, res) => {
  try {
    const pass = await passModel.findById(req.params.id)
      .populate("visitor")
      .populate({ path: "appointment", populate: { path: "host", select: "name email" } });

    if (!pass) return res.status(404).json({ message: "Pass not found" });

    const qrImageBuffer = await QRCode.toBuffer(pass.qrToken); // raw PNG bytes, not a data URL — pdfkit wants a Buffer or file path

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=pass-${pass._id}.pdf`);

    const doc = new PDFDocument({ size: "A6", margin: 20 });
    doc.pipe(res); // stream straight into the response

    doc.fontSize(18).text("Visitor Pass", { align: "center" });
    doc.moveDown();

    // Safely check if visitor exists and has an uploaded photo that exists on disk
    if (pass.visitor && pass.visitor.photoUrl) {
      const photoPath = path.join(__dirname, "..", pass.visitor.photoUrl);
      if (fs.existsSync(photoPath)) {
        doc.image(photoPath, { width: 80, align: "center" });
        doc.moveDown();
      }
    }

    doc.fontSize(12);
    // Safe checks in case visitor, appointment, or host documents have been deleted
    doc.text(`Name: ${pass.visitor ? pass.visitor.name : "N/A"}`);
    doc.text(`Host: ${(pass.appointment && pass.appointment.host) ? pass.appointment.host.name : "N/A"}`);
    doc.text(`Purpose: ${pass.appointment ? pass.appointment.purpose : "N/A"}`);
    doc.text(`Valid: ${pass.validFrom ? pass.validFrom.toLocaleString() : "N/A"} - ${pass.validTo ? pass.validTo.toLocaleString() : "N/A"}`);
    doc.moveDown();
    doc.image(qrImageBuffer, { width: 120, align: "center" });

    doc.end(); // this is what actually flushes and finishes the response
  } catch (err) {
    res.status(400).json({ message : err.message });
  }
};

// validating the pass at checkIN 
const findValidPass = async (qrToken) => {
  const pass = await passModel.findOne({ qrToken })
    .populate("visitor")
    .populate({ path: "appointment", populate: { path: "host", select: "name email" } });

  if (!pass) return { err: "Pass not found", status: 404 };
  if (pass.status === "revoked") return { err: "Pass has been revoked", status: 400 };
  if (new Date() > pass.validTo) return { err: "Pass has expired", status: 400 };

  return { pass };
};

exports.findValidPass = findValidPass;
