const mongoose = require("mongoose");

const appointmentModel = new mongoose.Schema({
    visitor:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref :"Visitor"
    },
    host:{
        type : mongoose.Schema.Types.ObjectId,
        required : true,
        ref: "User"
    },
    purpose :{
        type : String,
        required : true
    },
    scheduledDate : {
        type:Date
    },
    type :{
        type : String,
        enum : ["pre-registered", "walk-in"],
        required : true
    },
    status : {
        type : String,
        enum : ["pending", "approved", "rejected", "completed"],
        required : true,
        default: "pending"
    },
    inviteToken :{
        type : String,
    }

},
{timestamps:true}
)

module.exports = mongoose.model("Appointment" , appointmentModel);