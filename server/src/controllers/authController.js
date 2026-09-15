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
import crypto from "crypto";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Could not generate access and refresh tokens");
  }
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
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

  const lowercasedUsername = username.toLowerCase();
  const lowercasedEmail = email.toLowerCase();

  const existingEmail = await User.findOne({ email: lowercasedEmail });
  if (existingEmail) {
    throw new ApiError(409, "A user with this email already exists");
  }

  const existingUsername = await Member.findOne({ username: lowercasedUsername });
  if (existingUsername) {
    throw new ApiError(409, "Member with the same username already exists");
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
    email: lowercasedEmail,
    password,
    username: lowercasedUsername,
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

  const user = await User.findOne({ email: email.toLowerCase() });

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
        `${loggedInUser?.role} logged in successfully`,
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  const updatedUser = await User.findByIdAndUpdate(
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
  let redirectUrl = `${process.env.CLIENT_URL}/member/dashboard`;
  if (!user.isProfileCompleted) {
    redirectUrl = `${process.env.CLIENT_URL}/complete-profile`;
  } else if (user.role === "Admin") {
    redirectUrl = `${process.env.CLIENT_URL}/admin/dashboard`;
  } else if (user.role === "Trainer") {
    redirectUrl = `${process.env.CLIENT_URL}/trainer/dashboard`;
  }

  res
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .redirect(redirectUrl);
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
  
  const lowercasedUsername = username.toLowerCase();
  
  const existingMember = await Member.findOne({ username: lowercasedUsername });
  if (existingMember && existingMember._id.toString() !== req.user._id.toString()) {
    throw new ApiError(409, "Username is already taken");
  }

  const member = await Member.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: lowercasedUsername,
        age,
        isProfileCompleted: true,
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
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(200).json(new ApiResponse(200, {}, "Email sent successfully"));
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
      html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Request</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f4f5f7; padding: 40px 20px;">
      <tr>
        <td align="center">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            
            <!-- Header / Brand -->
            <tr>
              <td style="padding: 32px 40px 20px 40px; text-align: left;">
                <h2 style="margin: 0; font-size: 20px; font-weight: 700; color: #111827;">Password Reset</h2>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding: 0 40px; color: #4b5563; font-size: 15px; line-height: 1.6;">
                <p style="margin: 0 0 16px 0;">Hello,</p>
                <p style="margin: 0 0 24px 0;">We received a request to change the password for your account. Click the button below to choose a new password:</p>
                
                <!-- Action Button -->
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0;">
                  <tr>
                    <td align="center" style="border-radius: 6px; background-color: #2563eb;">
                      <a href="${redirectUrl}" target="_blank" style="font-size: 15px; font-weight: 600; color: #ffffff; text-decoration: none; padding: 12px 28px; display: inline-block; border-radius: 6px; border: 1px solid #2563eb;">Reset Password</a>
                    </td>
                  </tr>
                </table>

                <p style="margin: 0 0 16px 0; font-size: 13px; color: #6b7280;">
                  This link is valid for a limited time. If you didn't request a password change, you can safely ignore this email; your account remains secure.
                </p>

                <!-- Fallback Plain URL -->
                <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; word-break: break-all; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                  If the button above doesn't work, paste this link into your browser:<br>
                  <a href="${redirectUrl}" style="color: #2563eb; text-decoration: underline;">${redirectUrl}</a>
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 32px 40px; text-align: left; font-size: 12px; color: #9ca3af;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} GymEase. All rights reserved.</p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `,
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
  const lowercasedUsername = username.toLowerCase();
  
  const existingMember = await Member.findOne({ username: lowercasedUsername });
  if (existingMember && existingMember._id.toString() !== req.user._id.toString()) {
    throw new ApiError(409, "Username is already taken");
  }

  const member = await Member.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        username: lowercasedUsername,
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
  const lowercasedEmail = email.toLowerCase();
  
  const existingMember = await Member.findOne({ email: lowercasedEmail });
  if (existingMember && existingMember._id.toString() !== req.user._id.toString()) {
    throw new ApiError(409, "Email is already taken");
  }

  const member = await Member.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        email: lowercasedEmail,
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
      new: true,
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

const deleteAccount = asyncHandler(async (req, res) => {
  const member = await Member.findByIdAndDelete(req.user?._id);

  if (!member) {
    throw new ApiError(404, "Member not found or could not be deleted");
  }

  if (member.profilePicturePublicId) {
    await deleteFromCloudinary(member.profilePicturePublicId);
  }

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "Account deleted successfully"));
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
  deleteAccount,
  getCurrentUser,
};
