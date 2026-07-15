const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1]; // "Bearer xyz" -> "xyz"

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    // decoded looks like { _id: "...", iat: ..., exp: ... }
    // it's "_id" because that's the key you used in createToken(_id)

    //This is a projection method from Mongoose. Projection is the concept of specifying which fields of a document you want to include or exclude from the result.
    const user = await userModel.findById(decoded._id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    //You can attach custom properties to this req object. Here, you are creating a new property called user
    req.user = user;
    next();  // If all ok, pass control to the next middleware or route handler.
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


// authorize is a higher-order function. It takes a list of role names and returns an Express middleware function.

const authorize = (...allowedRoles) => { // rest parameter is used
  // This is the actual middleware that will be executed by Express.
  return (req, res, next) => {
    
    // !req.user -> Checks if the user is authenticated at all 
  
    if (!req.user || !allowedRoles.includes(req.user.role)) {
     
      return res.status(403).json({ message: "Access forbidden: insufficient role" });
    }
    // If all ok (no error is generated), pass control to the next middleware or route handler.
    next();
  };
};

module.exports = { authenticate, authorize };