import { Request } from 'express';
import { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';

export const uploadConfig = {
  // Maximum file size in bytes (default: 5MB)
  maxFileSize: 5 * 1024 * 1024, // 5MB
  
  // Allowed MIME types for images
  allowedMimeTypes: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ],
  
  // Upload directory
  uploadDir: path.join(process.cwd(), 'uploads', 'images'),
  
  // Base URL for serving uploaded files
  baseUrl: process.env.UPLOAD_BASE_URL || '/uploads/images',
};

// Ensure upload directory exists
export const ensureUploadDirectory = () => {
  const dir = uploadConfig.uploadDir;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// File filter function
export const imageFileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (uploadConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${uploadConfig.allowedMimeTypes.join(', ')}`
      )
    );
  }
};

// Generate unique filename
export const generateFilename = (req: Request, file: Express.Multer.File): string => {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  const ext = path.extname(file.originalname);
  return `${file.fieldname}-${uniqueSuffix}${ext}`;
};
