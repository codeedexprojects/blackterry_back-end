const multer = require("multer");
const path = require("path");
const fs = require("fs");

const sanitizeFolderName = (folderName) => {
  return folderName.replace(/\//g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
const routePath = path.basename(req.baseUrl || req.originalUrl || "default");
    const folderName = sanitizeFolderName(routePath);
    const folderPath = path.join(__dirname, "../uploads", folderName);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
      
    }
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`;
    cb(null, `file-${uniqueSuffix}`);
  },
  
});

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/jpg",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, JPG, PDF, and DOC/DOCX are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024,
  },
});


module.exports = {upload};

