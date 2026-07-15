const mongoose = require("mongoose");

const checkLogsModel = new mongoose.Schema({
   pass:{
    type : mongoose.Schema.Types.ObjectId ,
    required : true,
    ref:"Pass"
   },
   checkInTime:{
    type : Date,
   },
   checkOutTime:{
    type : Date,
   },
   gateId:{
    type : String,
    default : "main-gate"
   },
   scannedBy:{
    type : mongoose.Schema.Types.ObjectId,
    required :true,
    ref : "User"
   }
},
{timestamps : true}
)

module.exports = mongoose.model("CheckLog",checkLogsModel);