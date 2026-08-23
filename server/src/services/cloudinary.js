import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import ApiError from "../utils/ApiError.js";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
})

async function uploadOnCloudinary(localFilePath) {
    try {
        if(!localFilePath) throw new ApiError(400, "File path is required");
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log(response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
         try {
            if (fs.existsSync(localFilePath)) {
                fs.unlinkSync(localFilePath);
            }
        } catch (e) {
            console.error("Could not delete local file", e);
        }
        throw new ApiError(500, "Could not upload file on cloudinary");
    }
}

async function deleteFromCloudinary(publicId) {
    try {
        await cloudinary.uploader.destroy(publicId, { invalidate: true });
    } catch (error) {
        throw new ApiError(500, "Could not delete previous profile picture");
    }
}

export {
  uploadOnCloudinary,
  deleteFromCloudinary,
};