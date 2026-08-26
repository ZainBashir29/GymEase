import dotenv from "dotenv";
dotenv.config();
import Admin from "../../models/adminModel.js";
import connectDB from "../index.js";

const admin = [
  {
    fullName: "Zain Bashir",
    email: "zainbashir@gmail.com",
    password: "mightyZai123",
    role: "Admin",
  },
];

connectDB()
  .then(async () => {
    const existingAdmin = await Admin.findOne({
      email: admin.email,
    });
    if (existingAdmin) {
      console.log(`${admin.email} already exists`);
      return;
    }
    await Admin.create(admin);
    console.log(`${admin.fullName} created successfully`);
    console.log("Admin seeded in database successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Admin seeding in database failed");
    console.error(error);
    process.exit(1);
  });
