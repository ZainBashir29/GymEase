import mongoose from "mongoose";

export const adminPermissions = [
  "manage_members",
  "manage_trainers",
  "manage_gym_plans",
  "manage_membership_plans",
  "manage_products",
  "manage_orders",
  "manage_store",
  "manage_messages",
];

const adminInvitationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    originalRole: {
      type: String,
      enum: ["Member", "Trainer", null],
      default: null,
    },

    permissions: {
      type: [String],
      enum: adminPermissions,
      required: true,
    },

    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invitationTokenHash: {
      type: String,
      required: true,
    },

    invitationExpiry: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "revoked", "expired"],
      default: "pending",
    },

    isNewUser: {
      type: Boolean,
      required: true,
    },

    subAdminUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

const AdminInvitation = mongoose.model("AdminInvitation", adminInvitationSchema);

export default AdminInvitation;
