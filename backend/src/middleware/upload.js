import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
['documents', 'avatars', 'temp'].forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// File upload middleware configuration
export const uploadMiddleware = fileUpload({
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: path.join(uploadsDir, 'temp'),
  createParentPath: true,
  safeFileNames: true,
  preserveExtension: true
});

// Validate file type
export const validateFileType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were uploaded'
      });
    }

    const file = req.files.file;
    const fileExtension = path.extname(file.name).toLowerCase();

    if (!allowedTypes.includes(fileExtension)) {
      return res.status(400).json({
        success: false,
        message: `File type ${fileExtension} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    next();
  };
};

// Document file types
export const documentFileTypes = [
  '.pdf', '.doc', '.docx', '.txt', '.ppt', '.pptx',
  '.xls', '.xlsx', '.zip', '.rar'
];

// Image file types
export const imageFileTypes = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp'
];
