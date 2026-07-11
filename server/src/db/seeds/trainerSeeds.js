import mongoose from "mongoose";
import dotenv from "dotenv";

import connectDB from "../index.js";
import Trainer from "../../models/trainerModel.js";

dotenv.config();

/* Seed trainer data */
const trainerData = [
    {
        fullName: "Ahmed Raza",
        email: "ahmed.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Strength Training",
    },
    {
        fullName: "Ali Hassan",
        email: "ali.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Weight Loss",
    },
    {
        fullName: "Usman Khan",
        email: "usman.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Body Building",
    },
    {
        fullName: "Zain",
        email: "zain.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Strength Training",
    },
    {
        fullName: "Sajawal",
        email: "sajawal.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Olymic Weightlifting",
    },
    {
        fullName: "Riaz",
        email: "riaz.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "PCB Chairman",
    },
    {
        fullName: "Sultan",
        email: "sultan.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Wrestler",
    },
    {
        fullName: "Abdullah",
        email: "abdullah.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Strength Training",
    },
    {
        fullName: "Nawaz",
        email: "nawaz.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "All Rounder",
    },
    {
        fullName: "Raza",
        email: "raza.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Strength Training",
    },
    {
        fullName: "Sohail",
        email: "sohail.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Athelete",
    },
    {
        fullName: "Saim",
        email: "saim.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Merathon Runner",
    },
    {
        fullName: "Ali",
        email: "ali.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Walking enthusiast",
    },
    {
        fullName: "Bilal",
        email: "bilal.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Influencer",
    },
    {
        fullName: "Ahtasham",
        email: "ahtasham.trainer@gmail.com",
        password: "Trainer@123",
        role: "Trainer",
        expertise: "Record holder athlete",
    },
];

/* Seed trainers */
const seedTrainers = async () => {
    try {
        await connectDB();
        for (const trainer of trainerData) {
            const existingTrainer = await Trainer.findOne({
                email: trainer.email,
            });
            if (existingTrainer) {
                console.log(
                    `${trainer.email} already exists`
                );
                continue;
            }
            await Trainer.create(trainer);
            console.log(
                `${trainer.fullName} created successfully`
            );
        }
        console.log("Trainer seeding completed");
        process.exit(0);
    } catch (error) {
        console.error("Trainer seeding failed");
        console.error(error);
        process.exit(1);
    }
};
seedTrainers();
