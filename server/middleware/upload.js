// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Import fs to manage filesystem tasks programmatically

// Ensure uploads directory exists. Multer's custom destination function will fail if this folder is missing.
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// storage: WHERE and under WHAT NAME do uploaded files get saved on disk?
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir + "/");
  },
  filename: (req, file, cb) => {
    // if you just used file.originalname, two people uploading "photo.jpg"
    // would overwrite each other. So build a collision-proof name instead.
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// fileFilter: what TYPES of files are even allowed through?
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept
  } else {
    cb(new Error("Only JPEG, PNG, or WEBP images are allowed"), false); // reject
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max, stops someone uploading a 2GB file
});

module.exports = upload;