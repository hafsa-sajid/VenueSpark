import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';

// Config ko load karna zaroori hai
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        // File upload karein
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        // Upload ke baad local file delete karein
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response.secure_url; // Yeh URL controller mein jayega

    } catch (error) {
        // Error aaye toh bhi local file delete karein
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        console.log("Cloudinary Upload Error:", error);
        return null;
    }
}

export default uploadOnCloudinary;