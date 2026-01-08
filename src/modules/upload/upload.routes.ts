import express, { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { uploadConfig, imageFileFilter, generateFilename, ensureUploadDirectory } from './upload.config';
import {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
} from './upload.controller';
import { authenticate } from '../../middleware/auth';

// Ensure upload directory exists
ensureUploadDirectory();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, generateFilename(req, file));
  },
});

// Create multer instances
const uploadSingle = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
  },
});

const uploadMultiple = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: uploadConfig.maxFileSize,
    files: 10, // Maximum 10 files at once
  },
});

const router: Router = express.Router();

// Upload single image (protected route)
router.post(
  '/single',
  authenticate,
  uploadSingle.single('file'),
  uploadSingleImage
);

// Upload multiple images (protected route)
router.post(
  '/multiple',
  authenticate,
  uploadMultiple.array('files', 10),
  uploadMultipleImages
);

// Delete image (protected route)
router.delete('/:filename', authenticate, deleteImage);

export default router;
