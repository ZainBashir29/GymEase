import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import Member from "../models/memberModel.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerMember = asyncHandler(async (req, res) => {
    const {fullName, email, password, username, age} = req.body;

    if(!fullName) {
        throw new ApiError(400, "Full name is required");        
    }

    if(!email) {
        throw new ApiError(400, "Email is required");
    }

    if(!email.includes("@")) {
        throw new ApiError(400, "Wrong email format");
    }

    if(!password) {
        throw new ApiError(400, "Password is required");
    }

    if(!username) {
        throw new ApiError(400, "Username is required");
    }

    if(!age) {
        throw new ApiError(400, "Age is required");
    }

    if(age < 13) {
        throw new ApiError(400, "Invalid age");
    }

    const existingMember = await Member.findOne({
        $or: [{email}, {username}]
    })

    if(existingMember) {
        throw new ApiError(409, "Member with the same email or username already exists");
    }

    let profilePicture;

    if(req.file) {
        const pfpLocalPath = req.file.path;

        // if(!pfpLocalPath) {
        //     throw new ApiError(400, "No profile picture found");
        // }

        profilePicture = await uploadOnCloudinary(pfpLocalPath);

        if(!profilePicture) {
            throw new ApiError(500, "Could not upload file on cloudinary");
        }
    }

    const member = await Member.create({
        fullName,
        email,
        password,
        username: username.toLowerCase(),
        age,
        profilePicture: profilePicture?.url || "",
        isProfileCompleted: true,
    })

    const createdMember = await Member.findById(member._id).select("-password -refreshToken -googleId -isProfileCompleted");

    if(!createdMember) {
        throw new ApiError(500, "Could not create member");
    }

    res.status(201).json(new ApiResponse(201, createdMember, "Member registered successfully"));
})

const loginMember = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if(!email) {
        throw new ApiError(400, "Email is required");
    }

    if(!email.includes("@")) {
        throw new ApiError(400, "Wrong email format");
    }

    if(!password) {
        throw new ApiError(400, "Password is required");
    }

    const member = await Member.findOne("email");

    if(!member) {
        throw new ApiError(400, "No member found")
    }
}) 

export {
    registerMember,
}