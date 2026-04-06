const cloudinary = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'mansoon_DEV',
    allowed_formats: ['jpg', 'jpeg', 'png'], // ✅ Note: use snake_case key
  }
});

const upload = multer({ storage });

module.exports = upload;
