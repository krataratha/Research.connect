import fs from 'fs';
import path from 'path';

let cloudinary = null;

// Self-defensive initialization of Cloudinary
const initCloudinary = async () => {
  try {
    // Dynamic import to prevent crashes if the package is not installed
    const cloudinaryModule = await import('cloudinary');
    const cl = cloudinaryModule.default || cloudinaryModule;
    
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cl.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      cloudinary = cl.v2;
      console.log('☁️ Cloudinary storage configured successfully.');
    } else {
      console.log('⚠️ Cloudinary credentials missing in .env. Using local storage.');
    }
  } catch (err) {
    console.log('⚠️ Cloudinary package not loaded. Using local storage.');
  }
};

// Initialize
initCloudinary();

/**
 * Upload a file (supports Cloudinary and Local fallback)
 * @param {Object} file - Multer file object
 * @param {String} folder - Target folder/prefix
 * @returns {Promise<Object>} - { url, publicId }
 */
export const uploadFile = async (file, folder = 'research_connect') => {
  if (cloudinary) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(
          file.path,
          {
            folder: folder,
            resource_type: 'auto',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
      });
      
      // Clean up local temp file
      try {
        fs.unlinkSync(file.path);
      } catch (unlinkErr) {
        console.error('Failed to delete temp file:', unlinkErr);
      }

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (uploadErr) {
      console.error('Cloudinary upload failed, falling back to local:', uploadErr);
      // Fall through to local storage if Cloudinary fails
    }
  }

  // Local storage fallback
  // The file is already saved in 'uploads/' by Multer.
  const fileUrl = `/uploads/${file.filename}`;
  return {
    url: fileUrl,
    publicId: file.filename,
  };
};

/**
 * Delete a file from storage
 * @param {String} publicId - Cloudinary public ID or Local filename
 * @returns {Promise<void>}
 */
export const deleteFile = async (publicId) => {
  if (cloudinary && !publicId.includes('.')) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return;
    } catch (err) {
      console.error('Failed to delete from Cloudinary:', err);
    }
  }

  // Local file delete
  try {
    const localPath = path.join('uploads', publicId);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
  } catch (err) {
    console.error('Failed to delete local file:', err);
  }
};
