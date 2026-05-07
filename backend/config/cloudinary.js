import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        if (!fileBuffer) {
            resolve(null);
            return;
        }

        const uploadStream = cloudinary.uploader.upload_stream(
            { resource_type: "auto" },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Error:", error);
                    resolve(null);
                } else {
                    resolve(result.secure_url);
                }
            }
        );

        uploadStream.end(fileBuffer);
    });
};

export default uploadOnCloudinary;