import "dotenv/config";
import MembershipPlan from "../../models/membershipPlanModel.js";
import connectDB from "../index.js";

const membershipPlans = [
    {
        name: "Basic",
        price: 2000,
        details: ["Gym Access", "Fitness Plans", "Gym Store", "Sessions with trainers", "Progress Tracking"],
        duration: 30,
    },
    {
        name: "Standard",
        price: 4000,
        details: ["Gym Access", "Custom Fitness Plans", "Gym Store", "Sessions with trainers", "Progress Tracking", "Discounts on Gym Store Products"],
        duration: 30,
    },
    {
        name: "Premium",
        price: 6000,
        details: ["Gym Access", "Custom Fitness Plans", "Gym Store", "Sessions with multiple trainers", "Progress Tracking", "Discounts and Free Shipping of Gym Products"],
        duration: 30,
    }
]

connectDB().then(async () => {
    for(const membershipPlan of membershipPlans) {
        await MembershipPlan.findOneAndUpdate(
            {
                name: membershipPlan.name
            },
            {
                $set: membershipPlan
            },
            {
                upsert: true
            }
        )
    }
    console.log("Membership Plans seeded in database successfully");
    process.exit(0);
}).catch((error) => {
    console.error("Membership Plans seeding failed", error);
    process.exit(1);
})
