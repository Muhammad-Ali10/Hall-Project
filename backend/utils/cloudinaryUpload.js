const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'hall-booking') => {
  try {
    // Determine resource type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const resourceType = ['.mp4', '.mov', '.avi'].includes(ext) ? 'video' : 'image';
    
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType === 'video' ? 'video' : 'auto',
      use_filename: true,
      unique_filename: true,
    });
    
    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    // Delete local file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error('Failed to upload to Cloudinary');
  }
};

// Upload PDF or other documents
const uploadDocument = async (filePath, folder = 'hall-booking/documents') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'raw',
      use_filename: true,
      unique_filename: true,
    });
    
    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary document upload error:', error);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw new Error('Failed to upload document to Cloudinary');
  }
};

// Delete file from Cloudinary
const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
  }
};

module.exports = {
  uploadToCloudinary,
  uploadDocument,
  deleteFromCloudinary,
};

