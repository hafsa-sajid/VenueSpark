import multer from "multer";

// Use memory storage for Vercel/Production
// Files will be stored in RAM temporarily before uploading to Cloudinary
const storage = multer.memoryStorage();

const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

export default upload;
