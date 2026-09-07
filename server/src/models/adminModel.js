import User from "./userModel.js";
import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({});

adminSchema.pre("save", async function () {
  if (this.isNew) {
    const adminCount = await this.constructor.countDocuments();
    if (adminCount >= 1) {
      throw new Error("Only one Admin is permitted in the system.");
    }
  }
});

const Admin = User.discriminator("Admin", adminSchema);

export default Admin;
