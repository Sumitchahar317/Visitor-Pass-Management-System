const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");


const userSchema = new mongoose.Schema({
    name :{
        type: String,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true,
        lowercase: true,
        trim: true
    },
    password : {
        type:String,
        required : true
    },
    role : {
        type:String,
        enum :["admin","security","employee"]
    },
    phone :{
        type : String,
        
    },
    isActive : {
        type : Boolean,     
    }

},
{timestamps : true}
);


// register or SignUp static method (hasing password before saving it)

userSchema.statics.signUp = async function (name, email, password, role, phone){

    if(!email || !password){
        throw Error ('All credentials are required');
    }
    if(!validator.isEmail(email)){
        throw Error ('Email is not valid, please insert a valid email id');
    }
    if(!validator.isStrongPassword(password)){
        throw Error ('password is not strong, your password should have lowercase, upercase alphabet and symbols');
    }
    
    const exist = await this.findOne({email});

    if(exist){
        throw Error ('Email already exist , try with another email');
    }
    
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await this.create({name , email ,password:hash , role, phone})

    return user
}


// static function for user login 
userSchema.statics.login = async function (email,password){
    if(!email || !password){
        throw Error("All fields are required")
    }

    const user = await this.findOne({email}) 

    if(!user){
        throw Error("Invalid credentials")
    }

    const match = await bcrypt.compare(password , user.password);

    if(!match){
        throw Error("Invalid credentials")
    }
    return user

}

module.exports = mongoose.model("User" , userSchema);