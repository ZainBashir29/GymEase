import dotenv from "dotenv";
dotenv.config();
import connectDB from "../index.js";
import StoreProduct from "../../models/storeProductModel.js";

const products = [
  {
    name: "100% Gold Standard Whey Protein (5 lbs)",
    description:
      "Premium imported whey protein isolate blend providing 24g of protein per serving for muscle growth and recovery.",
    price: 18500,
    stock: 50,
    imageUrl:
      "/images/products/whey_protein.webp",
    imagePublicId: "",
    category: "Supplement",
    isActive: true,
  },
  {
    name: "Advanced Creatine Monohydrate Powder (300g)",
    description:
      "Unflavored pure micronized creatine monohydrate to enhance strength, power, and muscle volume during intense training.",
    price: 6500,
    stock: 80,
    imageUrl:
      "/images/products/creatine.webp",
    imagePublicId: "",
    category: "Supplement",
    isActive: true,
  },
  {
    name: "Explosive Pre-Workout Energy Powder (30 Servings)",
    description:
      "High-stimulant pre-workout formula loaded with beta-alanine and caffeine for extreme focus, energy, and muscle pumps.",
    price: 8900,
    stock: 40,
    imageUrl:
      "/images/products/pre_workout.webp",
    imagePublicId: "",
    category: "Supplement",
    isActive: true,
  },
  {
    name: "Plant-Based Organic Protein Shake (12 Pack)",
    description:
      "Ready-to-drink chocolate plant protein shake with 20g of organic pea and brown rice protein.",
    price: 9500,
    stock: 35,
    imageUrl:
      "/images/products/plant_protein.webp",
    imagePublicId: "",
    category: "Supplement",
    isActive: true,
  },
  {
    name: "Essential BCAA Recovery Matrix (300g)",
    description:
      "Branched-chain amino acids in a 2:1:1 ratio to promote intra-workout endurance and reduce muscle soreness.",
    price: 5800,
    stock: 60,
    imageUrl:
      "/images/products/bcaa.webp",
    imagePublicId: "",
    category: "Supplement",
    isActive: true,
  },
  {
    name: "Heavy-Duty Genuine Leather Lifting Belt",
    description:
      "4-inch wide thick leather weightlifting belt with a steel double-prong buckle for core stabilization during heavy squats and deadlifts.",
    price: 4200,
    stock: 25,
    imageUrl:
      "/images/products/lifting_belt.webp",
    imagePublicId: "",
    category: "Gym Gear",
    isActive: true,
  },
  {
    name: "Padded Weightlifting Wrist Straps",
    description:
      "Durable cotton wrist wraps with neoprene padding designed to improve grip strength for heavy deadlifts and row variations.",
    price: 1200,
    stock: 100,
    imageUrl:
      "/images/products/wrist_straps.webp",
    imagePublicId: "",
    category: "Gym Gear",
    isActive: true,
  },
  {
    name: "Stainless Steel Protein Shaker Bottle (700ml)",
    description:
      "Insulated leak-proof steel shaker bottle with a wire mixer ball to keep your post-workout shakes cold for hours.",
    price: 2800,
    stock: 75,
    imageUrl:
      "/images/products/shaker_bottle.webp",
    imagePublicId: "",
    category: "Gym Gear",
    isActive: true,
  },
  {
    name: "Heavy Duty Resistance Loop Bands Set (5 Levels)",
    description:
      "Set of 5 color-coded latex resistance bands ranging from extra-light to extra-heavy for mobility, warmups, and home workouts.",
    price: 2500,
    stock: 45,
    imageUrl:
      "/images/products/resistance_bands.webp",
    imagePublicId: "",
    category: "Gym Gear",
    isActive: true,
  },
  {
    name: "Breathable Anti-Slip Gym Gloves",
    description:
      "Lightweight workout gloves with padded silicone palm grips and breathable mesh back for comfortable training.",
    price: 1800,
    stock: 65,
    imageUrl:
      "/images/products/gym_gloves.webp",
    imagePublicId: "",
    category: "Gym Gear",
    isActive: true,
  },
];

connectDB()
  .then(async () => {
    for (const product of products) {
      await StoreProduct.findOneAndUpdate(
        {
          name: product.name,
        },
        {
          $set: product,
        },
        {
          upsert: true,
        },
      );
    }
    console.log("Store Products seeded in database successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Store Products seeding failed", error);
    process.exit(1);
  });
