const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary, uploadDocument } = require('./cloudinaryUpload');

// Ensure uploads directory exists for temporary storage
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads', { recursive: true });
}

// Temporary storage (files will be uploaded to Cloudinary and then deleted)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|mp4|mov|avi/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/pdf';

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and videos are allowed.'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

// Middleware to upload single file to Cloudinary
const uploadSingleToCloudinary = (fieldName, folder = 'hall-booking') => {
  return async (req, res, next) => {
    const uploadSingle = upload.single(fieldName);
    
    uploadSingle(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error',
        });
      }

      if (req.file) {
        try {
          const ext = path.extname(req.file.originalname).toLowerCase();
          const isDocument = ext === '.pdf';
          
          const result = isDocument
            ? await uploadDocument(req.file.path, `${folder}/documents`)
            : await uploadToCloudinary(req.file.path, folder);
          
          // Attach Cloudinary result to request
          req.file.cloudinary = result;
          req.file.url = result.url;
          req.file.publicId = result.publicId;
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload file to Cloudinary',
          });
        }
      }
      
      next();
    });
  };
};

// Middleware to upload multiple files to Cloudinary
const uploadMultipleToCloudinary = (fieldName, maxCount = 10, folder = 'hall-booking') => {
  return async (req, res, next) => {
    const uploadMultiple = upload.array(fieldName, maxCount);
    
    uploadMultiple(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error',
        });
      }

      if (req.files && req.files.length > 0) {
        try {
          const uploadPromises = req.files.map(async (file) => {
            const ext = path.extname(file.originalname).toLowerCase();
            const isDocument = ext === '.pdf';
            
            const result = isDocument
              ? await uploadDocument(file.path, `${folder}/documents`)
              : await uploadToCloudinary(file.path, folder);
            
            return {
              ...file,
              cloudinary: result,
              url: result.url,
              publicId: result.publicId,
            };
          });
          
          req.files = await Promise.all(uploadPromises);
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Failed to upload files to Cloudinary',
          });
        }
      }
      
      next();
    });
  };
};

// Legacy exports for backward compatibility (local storage)
const uploadSingle = (fieldName) => upload.single(fieldName);
const uploadMultiple = (fieldName, maxCount = 10) => upload.array(fieldName, maxCount);
const uploadFields = (fields) => upload.fields(fields);

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  uploadSingleToCloudinary,
  uploadMultipleToCloudinary,
};
