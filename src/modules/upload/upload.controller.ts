import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { uploadConfig, ensureUploadDirectory } from './upload.config';

interface UploadRequest extends Request {
  files?: Express.Multer.File[];
  file?: Express.Multer.File;
}

/**
 * Upload a single image file
 */
export const uploadSingleImage = async (req: UploadRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded',
      });
    }

    const fileUrl = `${uploadConfig.baseUrl}/${req.file.filename}`;
    const fullUrl = req.protocol + '://' + req.get('host') + fileUrl;

    res.status(200).json({
      success: true,
      data: {
        url: fullUrl,
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    console.error('Upload single image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image',
    });
  }
};

/**
 * Upload multiple image files
 */
export const uploadMultipleImages = async (req: UploadRequest, res: Response) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded',
      });
    }

    const baseUrl = req.protocol + '://' + req.get('host') + uploadConfig.baseUrl;

    const uploadedFiles = req.files.map((file) => ({
      url: `${baseUrl}/${file.filename}`,
      filename: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.status(200).json({
      success: true,
      data: {
        urls: uploadedFiles.map((f) => f.url),
        files: uploadedFiles,
      },
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images',
    });
  }
};

/**
 * Delete an uploaded image file
 */
export const deleteImage = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    if (!filename) {
      return res.status(400).json({
        success: false,
        error: 'Filename is required',
      });
    }

    const filePath = path.join(uploadConfig.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'File not found',
      });
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image',
    });
  }
};

// Initialize upload directory on module load
ensureUploadDirectory();
