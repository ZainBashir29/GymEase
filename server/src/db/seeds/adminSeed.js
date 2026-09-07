import dotenv from "dotenv";
dotenv.config();
import Admin from "../../models/adminModel.js";
import connectDB from "../index.js";

const adminData = {
  fullName: process.env.ADMIN_NAME || "Zain Bashir",
  email: process.env.ADMIN_EMAIL || "zainbashir@gmail.com",
  password: process.env.ADMIN_PASSWORD || "mightyZai123",
  role: "Admin",
};

connectDB()
  .then(async () => {
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      const existing = await Admin.findOne();
      console.log(
        `An admin already exists in the system (${existing.email}). Only one admin is permitted.`,
      );
      process.exit(0);
    }

    await Admin.create(adminData);
    console.log(`${adminData.fullName} (${adminData.email}) created successfully`);
    console.log("Admin seeded in database successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Admin seeding in database failed");
    console.error(error);
    process.exit(1);
  });

