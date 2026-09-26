import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/userModel.js";
import Admin from "../models/adminModel.js";
import AdminInvitation from "../models/adminInvitationModel.js";
import sendEmail from "../services/nodemailer.js";
import crypto from "crypto";

export const inviteSubAdmin = asyncHandler(async (req, res) => {
  const { email, fullName, permissions } = req.body;

  if (!email || !permissions || !Array.isArray(permissions)) {
    throw new ApiError(400, "Email and permissions array are required");
  }

  const lowercasedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: lowercasedEmail });

  if (existingUser && existingUser.role === "Admin") {
    throw new ApiError(400, "User is already an Admin");
  }

  const existingInvitation = await AdminInvitation.findOne({
    email: lowercasedEmail,
    status: "pending",
  });

  if (existingInvitation && existingInvitation.invitationExpiry > Date.now()) {
    throw new ApiError(
      400,
      "An active invitation is already pending for this email",
    );
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiry = Date.now() + 48 * 60 * 60 * 1000;

  let targetUserId = null;
  let originalRole = null;
  let isNewUser = true;

  if (existingUser) {
    targetUserId = existingUser._id;
    originalRole = existingUser.role;
    isNewUser = false;
  } else {
    if (!fullName) {
      throw new ApiError(400, "Full name is required for new users");
    }

    const placeholderPassword = crypto.randomBytes(32).toString("hex");
    const newAdmin = await Admin.create({
      fullName,
      email: lowercasedEmail,
      password: placeholderPassword,
      role: "Admin",
      adminType: "sub_admin",
      permissions: [],
      isActive: false,
    });

    targetUserId = newAdmin._id;
  }

  await AdminInvitation.create({
    email: lowercasedEmail,
    targetUserId,
    originalRole,
    permissions,
    invitedBy: req.user._id,
    invitationTokenHash: tokenHash,
    invitationExpiry: expiry,
    status: "pending",
    isNewUser,
  });

  const redirectUrl = `${process.env.CLIENT_URL}/accept-invitation/${rawToken}`;

  try {
    await sendEmail({
      to: lowercasedEmail,
      subject: "You've been invited to become a GymEase Sub-Admin",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2>GymEase Admin Invitation</h2>
          <p>Hello,</p>
          <p>You have been invited to become a Sub-Admin on the GymEase platform.</p>
          <p>Please click the button below within the next 48 hours to accept your invitation.</p>
          <a href="${redirectUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Accept Invitation</a>
          <p style="font-size: 12px; color: #6b7280;">If the button doesn't work, use this link:<br/>${redirectUrl}</p>
        </div>
      `,
      text: `You have been invited to become a GymEase Sub-Admin. Accept your invitation here (valid for 48 hours): ${redirectUrl}`,
    });
  } catch (error) {
    console.error("Failed to send invitation email:", error);
    throw new ApiError(500, "Failed to send invitation email");
  }

  res
    .status(200)
    .json(new ApiResponse(200, {}, "Invitation sent successfully"));
});

export const listSubAdmins = asyncHandler(async (req, res) => {
  const subAdmins = await Admin.find({ adminType: "sub_admin" }).select(
    "-password -refreshToken",
  );

  const pendingInvitations = await AdminInvitation.find({ status: "pending" })
    .select("-invitationTokenHash")
    .populate("invitedBy", "fullName email");

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { subAdmins, pendingInvitations },
        "Sub-admins fetched successfully",
      ),
    );
});

export const updateSubAdminPermissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { permissions } = req.body;

  if (!permissions || !Array.isArray(permissions)) {
    throw new ApiError(400, "Permissions array is required");
  }

  const subAdmin = await Admin.findOneAndUpdate(
    { _id: id, adminType: "sub_admin" },
    { $set: { permissions } },
    { new: true },
  ).select("-password -refreshToken");

  if (!subAdmin) {
    throw new ApiError(404, "Sub-admin not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, subAdmin, "Permissions updated successfully"));
});

export const revokeSubAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(403, "You cannot revoke your own access");
  }

  const pendingInvite = await AdminInvitation.findOne({ _id: id, status: "pending" });
  if (pendingInvite) {
    pendingInvite.status = "revoked";
    await pendingInvite.save();
    return res.status(200).json(new ApiResponse(200, {}, "Pending invitation revoked"));
  }

  const adminUser = await Admin.findOne({ _id: id, adminType: "sub_admin" });
  if (!adminUser) {
    throw new ApiError(404, "Sub-admin not found or already revoked");
  }

  const invitation = await AdminInvitation.findOne({ subAdminUserId: id, status: "accepted" });

  if (invitation) {
    invitation.status = "revoked";
    await invitation.save();
  }

  if (invitation && !invitation.isNewUser) {
    const db = mongoose.connection;
    await db.collection("users").updateOne(
      { _id: adminUser._id },
      {
        $set: { role: invitation.originalRole },
        $unset: {
          adminType: "",
          permissions: "",
          originalRole: "",
          refreshToken: "",
        },
      },
    );
  } else {
    await User.deleteOne({ _id: adminUser._id });
  }

  res.status(200).json(new ApiResponse(200, {}, "Sub-admin revoked successfully"));
});
