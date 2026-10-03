import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/userModel.js";

const verifyJwt = asyncHandler( async (req, _, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    if(!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, error.message || "Invalid access token");
    }
    const user = await User.findById(decodedToken._id).select("-password -refreshToken -isProfileCompleted -googleId");
    if(!user) {
        throw new ApiError(401, "Invalid access token");
    }
    const isExempt = 
        req.originalUrl.includes("/current-user") || 
        req.originalUrl.includes("/logout") || 
        req.originalUrl.includes("/conversations") || 
        req.originalUrl.includes("/messages");

    if(!user.isActive && !isExempt) {
        throw new ApiError(403, "This account has been deactivated");
    }
    req.user = user;
    next();
} ) 

export default verifyJwt;