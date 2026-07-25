import "dotenv/config";
import Trainer from "../../models/trainerModel.js";
import connectDB from "../index.js";

const trainers = [
  {
    fullName: "Ahmed Raza",
    email: "ahmed.raza.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Strength Training",
  },
  {
    fullName: "Ali Hassan",
    email: "ali.hassan.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Weight Loss & HIIT",
  },
  {
    fullName: "Usman Khan",
    email: "usman.khan.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Bodybuilding & Hypertrophy",
  },
  {
    fullName: "Zain Bashir",
    email: "zain.bashir.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Strength & Powerlifting",
  },
  {
    fullName: "Sajawal Ahmed",
    email: "sajawal.ahmed.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Olympic Weightlifting",
  },
  {
    fullName: "Riaz Ahmed",
    email: "riaz.ahmed.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Functional Training",
  },
  {
    fullName: "Sultan Ali",
    email: "sultan.ali.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Athletic Performance",
  },
  {
    fullName: "Abdullah Khan",
    email: "abdullah.khan.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Strength & Conditioning",
  },
  {
    fullName: "Nawaz Ahmed",
    email: "nawaz.ahmed.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Full Body Fitness",
  },
  {
    fullName: "Raza Hussain",
    email: "raza.hussain.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Powerlifting & Strength",
  },
  {
    fullName: "Sohail Ahmed",
    email: "sohail.ahmed.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Athletic Conditioning",
  },
  {
    fullName: "Saim Khan",
    email: "saim.khan.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Endurance & Conditioning",
  },
  {
    fullName: "Ali Raza",
    email: "ali.raza.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Mobility & Core Training",
  },
  {
    fullName: "Bilal Ahmed",
    email: "bilal.ahmed.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Functional Fitness & HIIT",
  },
  {
    fullName: "Ahtasham Khan",
    email: "ahtasham.khan.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Strength & Athletic Performance",
  },
  {
    fullName: "Hamza Tariq",
    email: "hamza.tariq.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Hypertrophy & Bodybuilding",
  },
  {
    fullName: "Hassan Javed",
    email: "hassan.javed.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Weight Loss & Conditioning",
  },
  {
    fullName: "Danish Iqbal",
    email: "danish.iqbal.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Mobility & Movement Training",
  },
  {
    fullName: "Fahad Malik",
    email: "fahad.malik.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "Powerlifting",
  },
  {
    fullName: "Muneeb Shah",
    email: "muneeb.shah.trainer@gmail.com",
    password: "Trainer@123",
    role: "Trainer",
    expertise: "General Fitness & Full Body Training",
  },
];

connectDB()
  .then(async () => {
    for (const trainer of trainers) {
      const existingTrainer = await Trainer.findOne({
        email: trainer.email,
      });
      if (existingTrainer) {
        console.log(`${trainer.email} already exists`);
        continue;
      }
      await Trainer.create(trainer);
      console.log(`${trainer.fullName} created successfully`);
    }
    console.log("Trainers seeded in database successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Trainers seeding in database failed");
    console.error(error);
    process.exit(1);
  });
