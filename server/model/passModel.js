const mongoose = require("mongoose");

const passSchema = new mongoose.Schema({
    appointment :{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref :"Appointment"
    },
    visitor:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref :"Visitor"
    },
    qrToken : {
        type : String,
        required : true,
        unique : true
    },
    status: {
        type: String,
        enum: ["issued", "checked-in", "checked-out", "expired", "revoked"],
        default: "issued"
    },
    validFrom: { 
        type: Date,
        required: true 
    },
    validTo: { 
        type: Date, 
        required: true 
    },
    issuedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    }
},
{timestamps:true}
)

module.exports = mongoose.model("Pass" , passSchema);