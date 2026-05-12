import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import User from "../models/userModel.js";

const verifyJwt = asyncHandler( (req, _, next) => {
    const token = req.cookies?.accessToken || req.headers?.authorization.replace("Bearer ", "");
    if(!token) {
        throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if(!decodedToken) {
        throw new ApiError(401, "Invalid access token");
    }
    const user = await User.findById(decodedToken._id).select("-password -refreshToken -isProfileCompleted -googleId");
    if(!user) {
        throw new ApiError(401, "Invalid access token");
    }
    req.user = user;
    next();
} ) 

export default verifyJwt;