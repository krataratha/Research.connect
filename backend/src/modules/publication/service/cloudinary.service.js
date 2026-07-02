const cloudinary = require('cloudinary').v2;
const env = require('../../../config/environment');

// Configure Cloudinary
cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret
});

/**
 * Uploads a file buffer directly to Cloudinary using a write stream.
 * @param {Buffer} fileBuffer - The file content as a Buffer.
 * @param {string} originalName - The original name of the file.
 * @returns {Promise<object>} Cloudinary upload result.
 */
const uploadFileBuffer = (fileBuffer, originalName) => {
  return new Promise((resolve, reject) => {
    // Generate a unique public ID from original filename
    const cleanName = originalName
      ? originalName.substring(0, originalName.lastIndexOf('.')).replace(/[^a-zA-Z0-9]/g, '_')
      : 'file';
    const publicId = `${cleanName}_${Date.now()}`;

    const uploadOptions = {
      folder: 'research-connect/publications',
      public_id: publicId,
      resource_type: 'auto' // Handle PDF, ZIP, CSV, DOCX, etc.
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });

    stream.end(fileBuffer);
  });
};

module.exports = {
  uploadFileBuffer
};
