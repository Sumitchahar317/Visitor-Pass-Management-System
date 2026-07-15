const userModel = require("../model/userModel");
const jwt = require("jsonwebtoken");

const createToken = (_id)=>{
    return jwt.sign({_id}, process.env.SECRET, {expiresIn:"3d"})

}

exports.register = async(req,res)=>{
    const {name, email, password, role, phone} = req.body ;

    try{
       //this function store the password after hasing it
       const user = await userModel.signUp(name, email, password, role, phone)

        res.status(201).json({ user, message: "User created successfully" });

    }catch(err){
        const status = err.message.includes("already exist") ? 409 : 400;
        res.status(status).json({message: err.message});
    }
}

exports.logIn = async (req,res)=>{
    const {email, password} = req.body ;

    try{
        const user = await userModel.login(email ,password);
        
        // generate jwt while logIn
        const token = createToken(user._id);

        res.status(200).json({user , token})

    }catch(err){
        const status = err.message.includes("required") ? 400 : 401;
        res.status(status).json({message : err.message})
    }
}

//  getting employee for walkin appointments — new function
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = {};
    if (role) filter.role = role;
    const users = await userModel.find(filter).select("name email role");
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// used for testing authentication and authrization

exports.getMe = async (req, res) => {
  res.status(200).json({ user: req.user });
};

