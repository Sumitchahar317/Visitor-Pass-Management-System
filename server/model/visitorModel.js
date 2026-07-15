const mongoose = require("mongoose")

const visitorSchema = new mongoose.Schema({
    name :{
        type : String,
        required : true
    },
    email :{
        type : String,
    },
    companyName : {
        type:String,
    },
    phone :{
        type : String,
    },
    photoUrl : {
        type : String
    }

},
{timestamps:true}
)

module.exports = mongoose.model("Visitor",visitorSchema);