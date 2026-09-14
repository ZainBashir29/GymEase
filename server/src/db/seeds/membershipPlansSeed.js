import "dotenv/config";
import MembershipPlan from "../../models/membershipPlanModel.js";
import connectDB from "../index.js";

const membershipPlans = [
  {
    name: "Basic",
    price: 3000,
    details: [
      "Gym Access",
      "Standard Gym Plans",
      "Access to Gym Store",
      "1 Assigned Personal Trainer",
      "Direct Chat with Trainer",
      "Progress Tracking Dashboard",
    ],
    duration: 30,
    maxTrainers: 1,
  },
  {
    name: "Standard",
    price: 4000,
    details: [
      "Gym Access",
      "Request Custom Gym Plans",
      "Access to Gym Store",
      "1 Assigned Personal Trainer",
      "Direct Chat with Trainer",
      "Progress Tracking Dashboard",
    ],
    duration: 30,
    maxTrainers: 1,
  },
  {
    name: "Premium",
    price: 6000,
    details: [
      "Gym Access",
      "Request Custom Gym Plans",
      "Access to Gym Store",
      "Up to 3 Assigned Trainers",
      "Direct Chat with Trainers",
      "Progress Tracking Dashboard",
    ],
    duration: 30,
    maxTrainers: 3,
  },
];

connectDB()
  .then(async () => {
    for (const membershipPlan of membershipPlans) {
      await MembershipPlan.findOneAndUpdate(
        {
          name: membershipPlan.name,
        },
        {
          $set: membershipPlan,
        },
        {
          upsert: true,
        },
      );
    }
    console.log("Membership Plans seeded in database successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Membership Plans seeding failed", error);
    process.exit(1);
  });
