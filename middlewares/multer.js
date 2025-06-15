
import multer from "multer";

// Set up multer to store files in the 'uploads' folder
const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads/"); 
  },
  filename: function (req, file, callback) {
    const uniqueName = Date.now() + "-" + file.originalname;
    callback(null, uniqueName);
  },
});

const upload = multer({ storage });

export default upload;
