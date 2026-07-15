const crypto = require("crypto");
const QRCode = require("qrcode");

// Import Mongoose models 
const visitorModel = require("../model/visitorModel");
const appointmentModel = require("../model/appointmentModel");
const { sendMail } = require("../utils/mailer");
const { generateOrGetPass } = require("./passController");


// emp/admin send inivation link to new visitor
exports.createInvite = async (req, res) => {
  const { name, email, purpose, scheduledDate } = req.body;
  
  try {
    const visitor = await visitorModel.create({name, email});

    const inviteToken = crypto.randomUUID();
    
    const appointment = await appointmentModel.create({
      visitor: visitor._id,
      // The host's ID is retrieved from `req.user`, which is attached by the `authenticate` middleware.
      host: req.user._id,  
      purpose,
      scheduledDate,
      type: "pre-registered",
      status: "pending",
      inviteToken,
    });

    sendMail( // will return promise. -just like moongose.connect
      visitor.email , //  to
      "You're invited — complete your visitor registration", // subject
      // body or html
      `<p>Hi ${visitor.name},</p>  
      <p>You've been invited to visit. Please complete your registration here:</p>
      <p><a href="${process.env.CLIENT_URL}/pre-register/${inviteToken}">Complete Registration</a></p>`
     )
     .catch(err => console.log("Invite email failed (non-fatal):", err.message)
    
    ) 
    

    res.status(201).json({"appointment":appointment, "inviteToken" :inviteToken });
  } catch (err) {
   
    res.status(400).json({message : err.message});
  }
};

//This is the endpoint a visitor would use when they click their (host) invite link.
exports.getByInviteToken = async (req, res) => {
  try {
    const appointment = await appointmentModel
      .findOne({ inviteToken: req.params.inviteToken })
      // Use Mongoose's `populate` to replace the visitor's ObjectId with the full visitor document.
      .populate("visitor")
      // Also populate the host's ObjectId, but only include their 'name' and 'email' for security.
      .populate("host", "name email"); 

    if (!appointment) return res.status(404).json({ message: "Invalid invite link" });
    
    res.status(200).json({"appointment": appointment});
  } catch (err) {
  
   res.status(400).json({message: err.message});
  }
};


// visitor self registration (visitor info updated by visitor)
exports.completeRegistration = async (req, res) => {
  const inviteToken = req.params.inviteToken;
  
  try {
    const appointment = await appointmentModel.findOne({inviteToken});
   
    if (!appointment) 
    return res.status(404).json({ message: "Invalid invite link" });

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updatedVisitor = await visitorModel.findByIdAndUpdate(
      appointment.visitor, // stores the id of visitor
      { phone: req.body.phone, ...(photoUrl && { photoUrl }) },//spread syntax unpacks the inner object
      { new: true }
    );

    res.status(200).json({visitor: updatedVisitor , "appointment" : appointment, "photoUrl": photoUrl});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// when vistor directly came to office for visit
exports.createWalkIn = async (req,res)=>{
  const {name, email, phone, companyName, host_id, purpose} = req.body ;

  try{
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const visitor = await visitorModel.create({name, email, phone, companyName, ...(photoUrl && { photoUrl })});

    const appointment = await appointmentModel.create({
      visitor : visitor._id,
      host : host_id,
      purpose : purpose,
      type : "walk-in",
      status: "approved", 

    })
    const pass = await generateOrGetPass(appointment, req.user._id);

    if (visitor.email) {
      const qrBuffer = await QRCode.toBuffer(pass.qrToken);

      sendMail(
        visitor.email,
        "Your visit has been approved — here's your pass",
        `<p>Hi ${visitor.name},</p>
         <p>Your visit has been approved. Please show this QR code at the gate on arrival:</p>
         <img src="cid:passQr" alt="Visitor pass QR code" />
         
         <p>Valid: ${pass.validFrom.toLocaleString()} – ${pass.validTo.toLocaleString()}</p>`,
        [{ filename: "pass-qr.png", content: qrBuffer, cid: "passQr" }]
      ).catch(err => console.log("Pass email failed (non-fatal):", err.message));
    }

    const qrDataUrl = await QRCode.toDataURL(pass.qrToken);

    res.status(201).json({ visitor, appointment, pass, qrDataUrl });

  }catch(err){
    res.status(400).json({message: err.message});
  }

}

// approve appointment  
exports.approveAppointment = async(req,res)=>{
  const id = req.params.id;

  try{
    const appointment = await appointmentModel.findById(id).populate("visitor");

    if(!appointment){
      return res.status(404).json({message : "Appointment not found"})
    }

    if(req.user.role !== "admin" && !appointment.host.equals(req.user._id)){
      return res.status(403).json({message : "Only the host employee or an admin can approve this appointment"})
    }

    appointment.status = "approved";
    await appointment.save();

    const pass = await generateOrGetPass(appointment, req.user._id);

    if (appointment.visitor?.email) {
      const qrBuffer = await QRCode.toBuffer(pass.qrToken);

      sendMail(
        appointment.visitor.email,
        "Your visit has been approved — here's your pass",
        `<p>Hi ${appointment.visitor.name},</p>
         <p>Your visit has been approved. Please show this QR code at the gate on arrival:</p>
         <img src="cid:passQr" alt="Visitor pass QR code" />
         <p>Valid: ${pass.validFrom.toLocaleString()} – ${pass.validTo.toLocaleString()}</p>`,
        [{ filename: "pass-qr.png", content: qrBuffer, cid: "passQr" }]
      ).catch(err => 
        console.log("Pass email failed (non-fatal):", err.message));
    }

    res.status(200).json(appointment);

  }catch(err){
    res.status(400).json({message: err.message});
  }
};

//Reject appointment 
exports.rejectAppointment = async(req,res)=>{
  const id = req.params.id;

  try{
    const appointment = await appointmentModel.findById(id);

    if(!appointment){
      return res.status(404).json({message : "Appointment not found"})
    }

    if(req.user.role !== "admin" && ! appointment.host.equals(req.user._id)){
      return res.status(403).json({message : "Only the host employee or an admin can approve this appointment"})
    }

  appointment.status = "rejected";
  await appointment.save();

  res.status(200).json(appointment);

}catch(err){
  res.status(400).json({message: err.message});
}
}
// All Appointment for admin/security and only hosted by employee can seen by employee 
exports.getAppointments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    // Employees only ever see appointments where they're the host.
    // Security/admin see everything (optionally narrowed by ?status=).
    if (req.user.role === "employee") {
      filter.host = req.user._id;
    }

    const appointments = await appointmentModel
      .find(filter)
      .populate("visitor")
      .populate("host", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(appointments);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// see an appointment by an id (everyone)
exports.getAppointmentById = async (req, res)=>{
  const id = req.params.id;
  try{
    const appointment = await appointmentModel.findById(id)
    .populate("visitor")
    .populate("host", "name email");

    if(!appointment){
      return res.status(404).json({message : "Appointment not found"})
    }

    res.status(200).json(appointment);

  }catch(err){
    res.status(400).json({message: err.message});
  }
}