import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import Member from "../models/memberModel.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../services/cloudinary.js";
import sendEmail from "../services/nodemailer.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (memberId) => {
  try {
    const member = await Member.findById(memberId);
    const accessToken = member.generateAccessToken();
    const refreshToken = member.generateRefreshToken();
    member.refreshToken = refreshToken;
    await member.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Could not generate access and refresh tokens");
  }
};

const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
};

const registerMember = asyncHandler(async (req, res) => {
  const { fullName, email, password, username, age } = req.body;

  if (!fullName) {
    throw new ApiError(400, "Full name is required");
  }

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Wrong email format");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  if (!username) {
    throw new ApiError(400, "Username is required");
  }

  if (!age) {
    throw new ApiError(400, "Age is required");
  }

  if (age < 13) {
    throw new ApiError(400, "Invalid age");
  }

  const existingMember = await Member.findOne({
    $or: [{ email }, { username }],
  });

  if (existingMember) {
    throw new ApiError(
      409,
      "Member with the same email or username already exists",
    );
  }

  let profilePicture;

  if (req.file) {
    const pfpLocalPath = req.file.path;

    // if(!pfpLocalPath) {
    //     throw new ApiError(400, "No profile picture found");
    // }

    profilePicture = await uploadOnCloudinary(pfpLocalPath);

    if (!profilePicture) {
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
    profilePicturePublicId: profilePicture?.public_id || "",
    isProfileCompleted: true,
    authMethod: "email",
  });

  const createdMember = await Member.findById(member._id).select(
    "-password -refreshToken -googleId -isProfileCompleted",
  );

  if (!createdMember) {
    throw new ApiError(500, "Could not create member");
  }

  res
    .status(201)
    .json(
      new ApiResponse(201, createdMember, "Member registered successfully"),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  if (!email.includes("@")) {
    throw new ApiError(400, "Wrong email format");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "No user account found");
  }

  if (!user.isActive) {
    throw new ApiError(403, "This account has been deactivated");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -isProfileCompleted -googleId",
  );

  res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        `${loggedInUser.role} logged in successfully`,
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  const updatedUser = await User.findOneAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      returnDocument: "after",
    },
  );
  if (!updatedUser) {
    throw new ApiError(500, "Could not update refreshToken");
  }
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, `${req.user.role} logged out successfully`));
});

const googleCallback = asyncHandler(async (req, res) => {
  const user = req.user;
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );
  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .redirect(
      user.isProfileCompleted
        ? `${process.env.CLIENT_URL}/member/dashboard`
        : `${process.env.CLIENT_URL}/complete-profile`,
    );
});

const completeProfile = asyncHandler(async (req, res) => {
  const { username, age } = req.body;
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  if (!age) {
    throw new ApiError(400, "Age is required");
  }
  if (age < 13) {
    throw new ApiError(400, "Age is too small");
  }
  const member = await Member.findOneAndUpdate(
    req.user._id,
    {
      $set: {
        username,
        age,
      },
    },
    {
      returnDocument: "after",
    },
  );
  if (!member) {
    throw new ApiError(500, "Could not update username and age");
  }
  const updatedMember = await Member.findById(member._id).select(
    "-password -refreshToken -googleId -isProfileCompleted",
  );
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedMember,
        "Member profile completed successfully",
      ),
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(404, "An email was sent if the email was valid");
  }
  const token = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpiry = Date.now() + 60 * 60 * 1000;
  await user.save({ validateBeforeSave: false });
  const redirectUrl = `${process.env.CLIENT_URL}/change-password/${token}`;
  try {
    await sendEmail({
      to: user.email,
      subject: "Password change request",
      html: `<p><a href="${redirectUrl}">Click here</a> to change your password.</p>`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    throw new ApiError(500, "Could not send email");
  }
  res.status(200).json(new ApiResponse(200, {}, "Email sent successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new ApiError(400, "Invalid or expired token");
  }

  try {
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, {}, "Password changed successfully"));
  } catch (error) {
    throw new ApiError(500, "Could not change password");
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const receivedRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!receivedRefreshToken) {
    throw new ApiError(401, "No refresh token found");
  }
  try {
    const decodedToken = jwt.verify(
      receivedRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (receivedRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or invalid");
    }
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
      decodedToken._id,
    );
    res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken,
          },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid refresh token");
  }
});

const updateFullName = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  if (!fullName) {
    throw new ApiError(400, "Full name is required");
  }
  const member = await Member.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName,
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken -isProfileCompleted -googleId");
  if (!member) {
    throw new ApiError(500, "Could not update full name");
  }
  res
    .status(200)
    .json(new ApiResponse(200, member, "Full name updated successfully"));
});

const updateUsername = asyncHandler(async (req, res) => {
  const { username } = req.body;
  if (!username) {
    throw new ApiError(400, "Username is required");
  }
  const member = await Member.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username,
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken -isProfileCompleted -googleId");
  if (!member) {
    throw new ApiError(500, "Could not update username");
  }
  res
    .status(200)
    .json(new ApiResponse(200, member, "Username updated successfully"));
});

const updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }
  if (!email.includes("@")) {
    throw new ApiError(400, "Invalid email format");
  }
  const member = await Member.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email,
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken -isProfileCompleted -googleId");
  if (!member) {
    throw new ApiError(500, "Could not update email");
  }
  res
    .status(200)
    .json(new ApiResponse(200, member, "Email updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword) {
    throw new ApiError(400, "Old password is required");
  }
  if (!newPassword) {
    throw new ApiError(400, "New password is required");
  }
  const member = await Member.findById(req.user._id);
  if (!member) {
    throw new ApiError(500, "Could not find member");
  }
  const isPasswordCorrect = await member.isPasswordCorrect(oldPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Incorrect old password");
  }
  try {
    member.password = newPassword;
    await member.save({ validateBeforeSave: false });
    res
      .status(200)
      .json(new ApiResponse(200, member, "Password changed successfully"));
  } catch (error) {
    throw new ApiError(500, "Could not change password");
  }
});

const changeProfilePicture = asyncHandler(async (req, res) => {
  const profilePictureLocalPath = req.file?.path;

  if (!profilePictureLocalPath) {
    throw new ApiError(400, "Profile picture is required");
  }

  const member = await Member.findById(req.user?._id);

  if (!member) {
    throw new ApiError(500, "Could not find member");
  }

  const previousPicturePublicId = member.profilePicturePublicId;

  const profilePicture = await uploadOnCloudinary(profilePictureLocalPath);

  if (!profilePicture) {
    throw new ApiError(500, "Could not upload profile picture on cloudinary");
  }

  const updatedMember = await Member.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        profilePicture: profilePicture.url || "",
        profilePicturePublicId: profilePicture.public_id || "",
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken -isProfileCompleted -googleId");

  if (!updatedMember) {
    throw new ApiError(500, "Could not change profile picture");
  }

  if (previousPicturePublicId) {
    try {
      const deletedPreviousPicture = await deleteFromCloudinary(
        previousPicturePublicId,
      );
    } catch (error) {
      console.error(
        `Could not delete previous profile picture ${previousPicturePublicId} from cloudinary`,
        error,
      );
    }
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedMember,
        "Profile picture uploaded or changed successfully",
      ),
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

export {
  registerMember,
  login,
  logout,
  googleCallback,
  completeProfile,
  forgotPassword,
  changePassword,
  refreshAccessToken,
  updateFullName,
  updateUsername,
  updateEmail,
  changeCurrentPassword,
  changeProfilePicture,
  getCurrentUser,
};
