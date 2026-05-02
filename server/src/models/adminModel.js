import User from "./userModel.js";
import mongoose from "mongoose";

const Admin = User.discriminator("Admin", new mongoose.Schema({}));

export default Admin;