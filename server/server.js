const express = require("express");
const app = express();
const dotenv = require("dotenv");
// Load environment variables immediately before requiring routes and controllers
dotenv.config();

const mongoose = require("mongoose");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

// Ensure uploads directory exists for image uploads in production
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// importing routes 
const userRoute = require("./route/userRoute");
const visitorRoute = require("./route/visitorRoute");
const appointmentRoute = require("./route/appointmentRoute");
const passRoute = require("./route/passRoute");
const checkLogsRoute = require("./route/checkLogsRoute");
const dashboardRoute = require("./route/dashboardRoute")

// cors is used for connecting client side to server side, as they are running on different ports
app.use(cors());
app.use(express.json());

const port = process.env.PORT;
const MONGO_URL = process.env.URL;

mongoose.connect(MONGO_URL)

.then(() => {
    console.log("Connected to db");
    app.listen(port, () => {
      console.log("Server is listening on port", port);
    });
  })
.catch((err)=>console.log("Error generated", err.message ))

// routing 
app.use("/api/auth", userRoute);
app.use("/api/users", userRoute);

app.use("/api/visitor", visitorRoute);
app.use("/uploads", express.static("uploads"))

app.use("/api/appointments", appointmentRoute);

app.use("/api/passes", passRoute);

app.use("/api/checkLogs", checkLogsRoute);

app.use("/api/dashboard", dashboardRoute);


app.get("/" , (req,res)=>{
  res.send("this is root page ")
})

// global error handler (image and upload errors)
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ Error: err.message });
});