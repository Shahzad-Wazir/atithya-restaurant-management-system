const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const hasCloudinaryConfig =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  !process.env.CLOUDINARY_CLOUD_NAME.includes("*");

const storage = hasCloudinaryConfig
  ? new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "atithya/menu-items",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 900, height: 900, crop: "limit" }],
      },
    })
  : multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
