import dotenv from "dotenv";
dotenv.config();
import Admin from "../../models/adminModel.js";
import connectDB from "../index.js";

const adminData = {
  fullName: process.env.ADMIN_NAME || "Zain Bashir",
  email: process.env.ADMIN_EMAIL || "zainbashir@gmail.com",
  password: process.env.ADMIN_PASSWORD || "mightyZai123",
  role: "Admin",
  adminType: "system_admin",
};

connectDB()
  .then(async () => {
    const existing = await Admin.findOne({ email: adminData.email });
    if (existing) {
      console.log(
        `System admin already exists (${existing.email}). Skipping seed.`,
      );
      process.exit(0);
    }

    await Admin.create(adminData);
    console.log(`${adminData.fullName} (${adminData.email}) created as system_admin`);
    console.log("System admin seeded in database successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Admin seeding in database failed");
    console.error(error);
    process.exit(1);
  });

