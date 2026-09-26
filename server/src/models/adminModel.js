import User from "./userModel.js";
import mongoose from "mongoose";
import { adminPermissions } from "./adminInvitationModel.js";

const adminSchema = new mongoose.Schema({
  adminType: {
    type: String,
    enum: ["system_admin", "sub_admin"],
    default: "system_admin",
  },

  permissions: {
    type: [String],
    enum: adminPermissions,
    default: [],
  },

  originalRole: {
    type: String,
    enum: ["Member", "Trainer", null],
    default: null,
  },
});

const Admin = User.discriminator("Admin", adminSchema);

export default Admin;
