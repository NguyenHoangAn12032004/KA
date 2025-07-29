import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../utils/database';

const router = Router();

// Create upload directory if it doesn't exist
const uploadDir = path.resolve(__dirname, '../../uploads');
const avatarDir = path.resolve(uploadDir, 'avatars');

console.log('📁 Upload directories:');
console.log('- Upload dir:', uploadDir);
console.log('- Avatar dir:', avatarDir);

if (!fs.existsSync(uploadDir)) {
  console.log('Creating upload directory...');
  fs.mkdirSync(uploadDir, { recursive: true });
}

if (!fs.existsSync(avatarDir)) {
  console.log('Creating avatars directory...');
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, avatarDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept images only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
    return cb(new Error('Only image files are allowed!'));
  }
  cb(null, true);
};

// Create upload middleware
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter
});

// Avatar upload route
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('📤 File uploaded:', req.file);

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Get the avatar URL - Always use base64 data URL
    const filePath = path.join(avatarDir, req.file.filename);
    let avatarUrl;
    
    try {
      // Read the file and convert to base64
      const fileData = fs.readFileSync(filePath);
      const fileExt = path.extname(req.file.filename).substring(1);
      const base64Data = fileData.toString('base64');
      avatarUrl = `data:image/${fileExt};base64,${base64Data}`;
      console.log('🔗 Avatar converted to base64 data URL successfully');
      
      // Delete the file after converting to base64 to save storage
      fs.unlinkSync(filePath);
      console.log('🗑️ Original file deleted after base64 conversion');
    } catch (err) {
      console.error('❌ Error processing file for base64 conversion:', err);
      // If there's an error with base64 conversion, use a default avatar or return error
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing avatar image' 
      });
    }

    // Find student profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Update avatar URL in database
    if (user.studentProfile) {
      // If profile exists, update it
      console.log('✏️ Updating existing profile with avatar');
      await prisma.studentProfile.update({
        where: { id: user.studentProfile.id },
        data: { avatar: avatarUrl }
      });
    } else {
      // If profile doesn't exist, create it
      console.log('🆕 Creating new profile with avatar');
      await prisma.studentProfile.create({
        data: {
          userId,
          avatar: avatarUrl,
          firstName: 'New',
          lastName: 'User'
        }
      });
    }

    res.json({ 
      success: true, 
      message: 'Avatar uploaded successfully',
      data: { avatarUrl }
    });
  } catch (error) {
    console.error('❌ Error uploading avatar:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading avatar: ' + (error as Error).message 
    });
  }
});

// Debug route to check if file exists
router.get('/check-file', (req, res) => {
  const filename = req.query.filename as string;
  if (!filename) {
    return res.status(400).json({ success: false, message: 'No filename provided' });
  }
  
  const filePath = path.join(avatarDir, filename);
  const exists = fs.existsSync(filePath);
  
  res.json({
    success: true,
    exists,
    path: filePath,
    size: exists ? fs.statSync(filePath).size : 0
  });
});

// Direct base64 route - get image as base64
router.get('/base64/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(avatarDir, filename);
  
  console.log('🔍 Attempting to serve file as base64:', filePath);
  
  if (fs.existsSync(filePath)) {
    try {
      const fileData = fs.readFileSync(filePath);
      const fileExt = path.extname(filename).substring(1);
      const base64Data = fileData.toString('base64');
      const dataUrl = `data:image/${fileExt};base64,${base64Data}`;
      
      res.json({ 
        success: true, 
        data: dataUrl 
      });
    } catch (err) {
      console.error('❌ Error converting file to base64:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Error converting file to base64' 
      });
    }
  } else {
    console.log('❌ File not found:', filePath);
    res.status(404).json({ 
      success: false, 
      message: 'File not found' 
    });
  }
});

// Serve uploaded files
router.get('/:type/:filename', (req, res) => {
  const { type, filename } = req.params;
  const filePath = path.resolve(uploadDir, type, filename);
  
  console.log('🔍 Attempting to serve file:', filePath);
  
  if (fs.existsSync(filePath)) {
    console.log('✅ File found, sending...');
    try {
      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      const mimeTypes: {[key: string]: string} = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif'
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      // Stream the file instead of using sendFile
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
      
      // Handle errors
      fileStream.on('error', (err) => {
        console.error('❌ Error streaming file:', err);
        res.status(500).end();
      });
    } catch (err) {
      console.error('❌ Error sending file:', err);
      res.status(500).json({ success: false, message: 'Error sending file' });
    }
  } else {
    console.log('❌ File not found:', filePath);
    res.status(404).json({ success: false, message: 'File not found' });
  }
});

export default router;
