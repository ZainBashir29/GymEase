import "dotenv/config";
import GymPlan from "../../models/gymPlans/gymPlanModel.js";
import connectDB from "../index.js";

const popularGymPlans = [
  {
    name: "Beginner Full Body Foundations",
    type: "popular",
    description:
      "A 3-day-per-week full body program designed for complete beginners. Builds foundational movement patterns, strength, and gym confidence from the ground up.",
    details:
      "Focuses on compound lifts: squat, deadlift, bench press, overhead press, and rows. Each session trains the entire body with 3 sets of 8-12 reps. Progressive overload is applied weekly by adding 2.5-5 kg to each lift. Rest days are equally important for muscle recovery.",
    duration: 8*7,
    trainerIds: [],
  },
  {
    name: "PPL - Push Pull Legs",
    type: "popular",
    description:
      "One of the most widely used 6-day intermediate splits. Groups muscles by movement pattern to maximize training frequency and volume.",
    details:
      "Push days target chest, shoulders, and triceps. Pull days target back and biceps. Leg days target quads, hamstrings, and glutes. Each muscle group is hit twice per week. Incorporates both compound and isolation exercises. Ideal for intermediates who have outgrown full body programming.",
    duration: 12*7,
    trainerIds: [],
  },
  {
    name: "StrongLifts 5x5",
    type: "popular",
    description:
      "A classic barbell strength program built on two alternating workouts, each consisting of five compound exercises done for 5 sets of 5 reps.",
    details:
      "Workout A: Squat, Bench Press, Barbell Row. Workout B: Squat, Overhead Press, Deadlift. Workouts alternate 3 times per week with at least one rest day between sessions. Weight increases by 2.5 kg every session. Squatting every session accelerates lower body development and hormonal output.",
    duration: 16*7,
    trainerIds: [],
  },
  {
    name: "HIIT Fat Burner",
    type: "popular",
    description:
      "A high-intensity interval training program designed to torch fat, improve cardiovascular capacity, and maintain lean muscle mass in minimal time.",
    details:
      "Sessions last 30-45 minutes and alternate between high-effort bursts (20-40 seconds) and active rest (10-20 seconds). Exercises include burpees, jump squats, mountain climbers, battle ropes, and sprint intervals. Done 4 days per week. Heart rate should stay between 80-95% of max during work intervals.",
    duration: 6*7,
    trainerIds: [],
  },
  {
    name: "Classic Bodybuilding Hypertrophy Split",
    type: "popular",
    description:
      "A traditional 5-day bro split targeting one or two muscle groups per session. Designed to maximize hypertrophy through high volume and isolation work.",
    details:
      "Day 1: Chest. Day 2: Back. Day 3: Shoulders. Day 4: Arms (Biceps & Triceps). Day 5: Legs. Each session includes 4-5 exercises, 3-4 sets, and 8-15 rep ranges. Incorporates drop sets and supersets in the final weeks. Prioritizes mind-muscle connection and pump-based training.",
    duration: 12*7,
    trainerIds: [],
  },
  {
    name: "12-Week Body Recomposition",
    type: "popular",
    description:
      "A structured program combining resistance training and cardio to simultaneously reduce body fat and build lean muscle — ideal for intermediate trainees.",
    details:
      "Resistance training 4 days per week using an Upper/Lower split. Two additional low-intensity steady-state (LISS) cardio sessions of 30-40 minutes. Nutrition emphasis on high protein intake (2g per kg of bodyweight). Progressive overload applied biweekly. Deload week built into weeks 6 and 12.",
    duration: 12*7,
    trainerIds: [],
  },
  {
    name: "Upper/Lower Power & Hypertrophy",
    type: "popular",
    description:
      "A 4-day upper/lower split that pairs power-focused sessions with hypertrophy-focused sessions each week for a balanced strength and size outcome.",
    details:
      "Monday: Upper Power (heavy compounds, 3-5 reps). Tuesday: Lower Power (squat and deadlift variants, 3-5 reps). Thursday: Upper Hypertrophy (moderate weight, 8-12 reps, higher volume). Friday: Lower Hypertrophy (lunges, leg press, Romanian deadlift, 8-15 reps). Each session takes 60-75 minutes.",
    duration: 10*7,
    trainerIds: [],
  },
  {
    name: "Athletic Performance & Conditioning",
    type: "popular",
    description:
      "A sports-performance program combining explosive power training, agility drills, and functional conditioning for athletes and active individuals.",
    details:
      "Three strength sessions per week built around Olympic lift variations (power clean, hang snatch), plyometrics (box jumps, broad jumps), and multi-directional agility work. Two conditioning sessions using circuit-style training. Mobility and flexibility work embedded at the start and end of every session. Periodized across three 3-week blocks.",
    duration: 9*7,
    trainerIds: [],
  },
  {
    name: "Core Strength & Mobility",
    type: "popular",
    description:
      "A low-impact program targeting deep core stabilizers, spinal mobility, and postural correction. Suitable for all fitness levels including post-rehab individuals.",
    details:
      "Sessions are 45 minutes, 4 days per week. Exercises include dead bugs, pallof presses, bird dogs, plank variations, hollow body holds, and cat-camel stretches. Incorporates breathwork and diaphragmatic breathing techniques. Pairs well as an accessory program alongside any primary strength plan. No equipment required beyond a mat.",
    duration: 6*7,
    trainerIds: [],
  },
  {
    name: "Powerlifting Peaking Program",
    type: "popular",
    description:
      "A competition-style powerlifting program that peaks the squat, bench press, and deadlift for maximum 1-rep max performance at the end of the cycle.",
    details:
      "Based on percentage-based loading (65-95% of 1RM). Three primary training days built around the competition lifts. Accessory work targets weak points and supporting muscle groups. Intensity increases and volume decreases weekly as the peak approaches. Final week is a taper with opener attempts. Not recommended for beginners.",
    duration: 10*7,
    trainerIds: [],
  },
];

connectDB().then(async () => {
    for(const gymPlan of popularGymPlans) {
        await GymPlan.findOneAndUpdate(
            {
                name: gymPlan.name
            },
            {
                $set: gymPlan
            },
            {
                upsert: true
            }
        )
    }
    console.log("Popular Gym Plans seeded in database successfully");
    process.exit(0);
}).catch((error) => {
    console.error("Popular Gym Plans seeding failed", error);
    process.exit(1);
})
