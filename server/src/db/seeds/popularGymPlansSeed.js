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
    sessions: [
      {
        name: "Full Body A",
        exercises: [
          { name: "Barbell Squat", sets: 3, reps: 8 },
          { name: "Bench Press", sets: 3, reps: 10 },
          { name: "Bent Over Row", sets: 3, reps: 10 },
          { name: "Walking Lunges", sets: 3, reps: 12 },
          { name: "Plank", sets: 3, duration: "45 sec" },
        ],
      },
      {
        name: "Full Body B",
        exercises: [
          { name: "Deadlift", sets: 3, reps: 5 },
          { name: "Overhead Press", sets: 3, reps: 8 },
          { name: "Lat Pulldown", sets: 3, reps: 12 },
          { name: "Leg Press", sets: 3, reps: 12 },
          { name: "Hanging Knee Raise", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Full Body C",
        exercises: [
          { name: "Front Squat", sets: 3, reps: 8 },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
          { name: "Seated Cable Row", sets: 3, reps: 10 },
          { name: "Romanian Deadlift", sets: 3, reps: 10 },
          { name: "Russian Twist", sets: 3, reps: 20 },
        ],
      },
    ],
    duration: 8 * 7,
    trainerIds: [],
  },
  {
    name: "PPL - Push Pull Legs",
    type: "popular",
    description:
      "One of the most widely used 6-day intermediate splits. Groups muscles by movement pattern to maximize training frequency and volume.",
    details:
      "Push days target chest, shoulders, and triceps. Pull days target back and biceps. Leg days target quads, hamstrings, and glutes. Each muscle group is hit twice per week. Incorporates both compound and isolation exercises. Ideal for intermediates who have outgrown full body programming.",
    sessions: [
      {
        name: "Push",
        exercises: [
          { name: "Bench Press", sets: 4, reps: 8 },
          { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
          { name: "Shoulder Press", sets: 3, reps: 10 },
          { name: "Lateral Raise", sets: 3, reps: 15 },
          { name: "Tricep Pushdown", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Pull",
        exercises: [
          { name: "Deadlift", sets: 3, reps: 5 },
          { name: "Pull Up", sets: 3, reps: 10 },
          { name: "Barbell Row", sets: 3, reps: 10 },
          { name: "Face Pull", sets: 3, reps: 15 },
          { name: "Barbell Curl", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Legs",
        exercises: [
          { name: "Back Squat", sets: 4, reps: 8 },
          { name: "Romanian Deadlift", sets: 3, reps: 10 },
          { name: "Leg Press", sets: 3, reps: 12 },
          { name: "Leg Curl", sets: 3, reps: 12 },
          { name: "Standing Calf Raise", sets: 4, reps: 15 },
        ],
      },
      {
        name: "Push 2",
        exercises: [
          { name: "Incline Bench Press", sets: 4, reps: 8 },
          { name: "Cable Fly", sets: 3, reps: 12 },
          { name: "Arnold Press", sets: 3, reps: 10 },
          { name: "Cable Lateral Raise", sets: 3, reps: 15 },
          { name: "Skull Crusher", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Pull 2",
        exercises: [
          { name: "Lat Pulldown", sets: 3, reps: 10 },
          { name: "Seated Cable Row", sets: 3, reps: 10 },
          { name: "Chest Supported Row", sets: 3, reps: 12 },
          { name: "Hammer Curl", sets: 3, reps: 12 },
          { name: "Rear Delt Fly", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Legs 2",
        exercises: [
          { name: "Front Squat", sets: 4, reps: 8 },
          { name: "Bulgarian Split Squat", sets: 3, reps: 10 },
          { name: "Hip Thrust", sets: 3, reps: 10 },
          { name: "Leg Extension", sets: 3, reps: 12 },
          { name: "Seated Calf Raise", sets: 4, reps: 15 },
        ],
      },
    ],
    duration: 12 * 7,
    trainerIds: [],
  },
  {
    name: "StrongLifts 5x5",
    type: "popular",
    description:
      "A classic barbell strength program built on two alternating workouts, each consisting of five compound exercises done for 5 sets of 5 reps.",
    details:
      "Workout A: Squat, Bench Press, Barbell Row. Workout B: Squat, Overhead Press, Deadlift. Workouts alternate 3 times per week with at least one rest day between sessions. Weight increases by 2.5 kg every session. Squatting every session accelerates lower body development and hormonal output.",
    sessions: [
      {
        name: "Workout A",
        exercises: [
          { name: "Back Squat", sets: 5, reps: 5 },
          { name: "Bench Press", sets: 5, reps: 5 },
          { name: "Barbell Row", sets: 5, reps: 5 },
        ],
      },
      {
        name: "Workout B",
        exercises: [
          { name: "Back Squat", sets: 5, reps: 5 },
          { name: "Overhead Press", sets: 5, reps: 5 },
          { name: "Deadlift", sets: 1, reps: 5 },
        ],
      },
    ],
    duration: 16 * 7,
    trainerIds: [],
  },
  {
    name: "HIIT Fat Burner",
    type: "popular",
    description:
      "A high-intensity interval training program designed to torch fat, improve cardiovascular capacity, and maintain lean muscle mass in minimal time.",
    details:
      "Sessions last 30-45 minutes and alternate between high-effort bursts (20-40 seconds) and active rest (10-20 seconds). Exercises include burpees, jump squats, mountain climbers, battle ropes, and sprint intervals. Done 4 days per week. Heart rate should stay between 80-95% of max during work intervals.",
    sessions: [
      {
        name: "HIIT Circuit A",
        exercises: [
          { name: "Burpees", sets: 4, reps: 15 },
          { name: "Mountain Climbers", sets: 4, duration: "30 sec" },
          { name: "Jump Squats", sets: 4, reps: 15 },
          { name: "Push Ups", sets: 4, reps: 12 },
          { name: "High Knees", sets: 4, duration: "30 sec" },
        ],
      },
      {
        name: "HIIT Circuit B",
        exercises: [
          { name: "Battle Ropes", sets: 4, duration: "30 sec" },
          { name: "Kettlebell Swings", sets: 4, reps: 20 },
          { name: "Box Jumps", sets: 4, reps: 12 },
          { name: "Jump Lunges", sets: 4, reps: 12 },
          { name: "Sprint", sets: 8, duration: "20 sec" },
        ],
      },
      {
        name: "HIIT Circuit C",
        exercises: [
          { name: "Jump Rope", sets: 5, duration: "1 min" },
          { name: "Bear Crawls", sets: 4, duration: "30 sec" },
          { name: "Medicine Ball Slams", sets: 4, reps: 15 },
          { name: "Skaters", sets: 4, reps: 20 },
          { name: "Plank", sets: 3, duration: "1 min" },
        ],
      },
      {
        name: "HIIT Circuit D",
        exercises: [
          { name: "Rowing Machine Sprint", sets: 8, duration: "30 sec" },
          { name: "Jumping Jacks", sets: 4, duration: "45 sec" },
          { name: "Russian Twists", sets: 3, reps: 20 },
          { name: "Mountain Climbers", sets: 4, duration: "40 sec" },
          { name: "Bicycle Crunches", sets: 3, reps: 20 },
        ],
      },
    ],
    duration: 6 * 7,
    trainerIds: [],
  },
  {
    name: "Classic Bodybuilding Hypertrophy Split",
    type: "popular",
    description:
      "A traditional 5-day bro split targeting one or two muscle groups per session. Designed to maximize hypertrophy through high volume and isolation work.",
    details:
      "Day 1: Chest. Day 2: Back. Day 3: Shoulders. Day 4: Arms (Biceps & Triceps). Day 5: Legs. Each session includes 4-5 exercises, 3-4 sets, and 8-15 rep ranges. Incorporates drop sets and supersets in the final weeks. Prioritizes mind-muscle connection and pump-based training.",
    sessions: [
      {
        name: "Chest",
        exercises: [
          { name: "Bench Press", sets: 4, reps: 8 },
          { name: "Incline Dumbbell Press", sets: 4, reps: 10 },
          { name: "Cable Fly", sets: 3, reps: 12 },
          { name: "Chest Dips", sets: 3, reps: 10 },
          { name: "Pec Deck", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Back",
        exercises: [
          { name: "Pull Ups", sets: 4, reps: 8 },
          { name: "Barbell Row", sets: 4, reps: 10 },
          { name: "Lat Pulldown", sets: 3, reps: 12 },
          { name: "Seated Cable Row", sets: 3, reps: 12 },
          { name: "Straight Arm Pulldown", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Shoulders",
        exercises: [
          { name: "Military Press", sets: 4, reps: 8 },
          { name: "Lateral Raise", sets: 3, reps: 15 },
          { name: "Front Raise", sets: 3, reps: 12 },
          { name: "Rear Delt Fly", sets: 3, reps: 15 },
          { name: "Shrugs", sets: 4, reps: 15 },
        ],
      },
      {
        name: "Arms",
        exercises: [
          { name: "Barbell Curl", sets: 3, reps: 10 },
          { name: "Hammer Curl", sets: 3, reps: 12 },
          { name: "Preacher Curl", sets: 3, reps: 12 },
          { name: "Skull Crushers", sets: 3, reps: 10 },
          { name: "Tricep Rope Pushdown", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Legs",
        exercises: [
          { name: "Back Squat", sets: 4, reps: 8 },
          { name: "Romanian Deadlift", sets: 4, reps: 10 },
          { name: "Leg Press", sets: 3, reps: 12 },
          { name: "Leg Curl", sets: 3, reps: 15 },
          { name: "Standing Calf Raise", sets: 4, reps: 20 },
        ],
      },
    ],
    duration: 12 * 7,
    trainerIds: [],
  },
  {
    name: "12-Week Body Recomposition",
    type: "popular",
    description:
      "A structured program combining resistance training and cardio to simultaneously reduce body fat and build lean muscle — ideal for intermediate trainees.",
    details:
      "Resistance training 4 days per week using an Upper/Lower split. Two additional low-intensity steady-state (LISS) cardio sessions of 30-40 minutes. Nutrition emphasis on high protein intake (2g per kg of bodyweight). Progressive overload applied biweekly. Deload week built into weeks 6 and 12.",
    sessions: [
      {
        name: "Upper Body",
        exercises: [
          { name: "Bench Press", sets: 4, reps: 8 },
          { name: "Pull Ups", sets: 3, reps: 10 },
          { name: "Shoulder Press", sets: 3, reps: 10 },
          { name: "Seated Cable Row", sets: 3, reps: 12 },
          { name: "Tricep Pushdown", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Lower Body",
        exercises: [
          { name: "Back Squat", sets: 4, reps: 8 },
          { name: "Romanian Deadlift", sets: 3, reps: 10 },
          { name: "Leg Press", sets: 3, reps: 12 },
          { name: "Leg Curl", sets: 3, reps: 15 },
          { name: "Standing Calf Raise", sets: 4, reps: 20 },
        ],
      },
      {
        name: "LISS Cardio",
        exercises: [
          { name: "Treadmill Walk", sets: 1, duration: "40 min" },
          { name: "Stretching", sets: 1, duration: "10 min" },
        ],
      },
      {
        name: "Upper Body 2",
        exercises: [
          { name: "Incline Dumbbell Press", sets: 4, reps: 10 },
          { name: "Lat Pulldown", sets: 3, reps: 12 },
          { name: "Arnold Press", sets: 3, reps: 10 },
          { name: "Cable Fly", sets: 3, reps: 15 },
          { name: "EZ Bar Curl", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Lower Body 2",
        exercises: [
          { name: "Deadlift", sets: 3, reps: 5 },
          { name: "Bulgarian Split Squat", sets: 3, reps: 10 },
          { name: "Leg Extension", sets: 3, reps: 15 },
          { name: "Hip Thrust", sets: 3, reps: 12 },
          { name: "Seated Calf Raise", sets: 4, reps: 20 },
        ],
      },
      {
        name: "Recovery Cardio",
        exercises: [
          { name: "Cycling", sets: 1, duration: "35 min" },
          { name: "Foam Rolling", sets: 1, duration: "10 min" },
          { name: "Mobility Drills", sets: 1, duration: "10 min" },
        ],
      },
    ],
    duration: 12 * 7,
    trainerIds: [],
  },
  {
    name: "Upper/Lower Power & Hypertrophy",
    type: "popular",
    description:
      "A 4-day upper/lower split that pairs power-focused sessions with hypertrophy-focused sessions each week for a balanced strength and size outcome.",
    details:
      "Monday: Upper Power (heavy compounds, 3-5 reps). Tuesday: Lower Power (squat and deadlift variants, 3-5 reps). Thursday: Upper Hypertrophy (moderate weight, 8-12 reps, higher volume). Friday: Lower Hypertrophy (lunges, leg press, Romanian deadlift, 8-15 reps). Each session takes 60-75 minutes.",
    sessions: [
      {
        name: "Upper Power",
        exercises: [
          { name: "Bench Press", sets: 5, reps: 5 },
          { name: "Barbell Row", sets: 5, reps: 5 },
          { name: "Overhead Press", sets: 4, reps: 6 },
          { name: "Weighted Pull Up", sets: 4, reps: 6 },
          { name: "Farmer Carry", sets: 3, duration: "40 sec" },
        ],
      },
      {
        name: "Lower Power",
        exercises: [
          { name: "Back Squat", sets: 5, reps: 5 },
          { name: "Deadlift", sets: 3, reps: 5 },
          { name: "Front Squat", sets: 3, reps: 6 },
          { name: "Standing Calf Raise", sets: 4, reps: 15 },
          { name: "Hanging Leg Raise", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Upper Hypertrophy",
        exercises: [
          { name: "Incline Dumbbell Press", sets: 4, reps: 10 },
          { name: "Seated Cable Row", sets: 4, reps: 10 },
          { name: "Cable Fly", sets: 3, reps: 15 },
          { name: "Lateral Raise", sets: 3, reps: 15 },
          { name: "Hammer Curl", sets: 3, reps: 12 },
          { name: "Tricep Rope Pushdown", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Lower Hypertrophy",
        exercises: [
          { name: "Leg Press", sets: 4, reps: 12 },
          { name: "Romanian Deadlift", sets: 4, reps: 10 },
          { name: "Bulgarian Split Squat", sets: 3, reps: 10 },
          { name: "Leg Curl", sets: 3, reps: 15 },
          { name: "Seated Calf Raise", sets: 4, reps: 20 },
        ],
      },
    ],
    duration: 10 * 7,
    trainerIds: [],
  },
  {
    name: "Athletic Performance & Conditioning",
    type: "popular",
    description:
      "A sports-performance program combining explosive power training, agility drills, and functional conditioning for athletes and active individuals.",
    details:
      "Three strength sessions per week built around Olympic lift variations (power clean, hang snatch), plyometrics (box jumps, broad jumps), and multi-directional agility work. Two conditioning sessions using circuit-style training. Mobility and flexibility work embedded at the start and end of every session. Periodized across three 3-week blocks.",
    sessions: [
      {
        name: "Explosive Strength",
        exercises: [
          { name: "Power Clean", sets: 5, reps: 3 },
          { name: "Front Squat", sets: 4, reps: 5 },
          { name: "Box Jump", sets: 4, reps: 8 },
          { name: "Pull Up", sets: 3, reps: 10 },
          { name: "Plank", sets: 3, duration: "1 min" },
        ],
      },
      {
        name: "Speed & Agility",
        exercises: [
          { name: "Agility Ladder", sets: 5, duration: "30 sec" },
          { name: "Cone Shuttle Drill", sets: 6, duration: "20 sec" },
          { name: "Broad Jump", sets: 4, reps: 8 },
          { name: "Battle Rope", sets: 4, duration: "30 sec" },
          { name: "Medicine Ball Slam", sets: 4, reps: 15 },
        ],
      },
      {
        name: "Functional Strength",
        exercises: [
          { name: "Deadlift", sets: 4, reps: 5 },
          { name: "Walking Lunges", sets: 3, reps: 12 },
          { name: "Push Press", sets: 4, reps: 6 },
          { name: "Farmer Carry", sets: 3, duration: "45 sec" },
          { name: "Hanging Knee Raise", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Conditioning Circuit",
        exercises: [
          { name: "Burpees", sets: 4, reps: 15 },
          { name: "Kettlebell Swing", sets: 4, reps: 20 },
          { name: "Rowing Machine", sets: 4, duration: "2 min" },
          { name: "Sled Push", sets: 4, duration: "25 m" },
          { name: "Mountain Climbers", sets: 4, duration: "30 sec" },
        ],
      },
      {
        name: "Mobility & Recovery",
        exercises: [
          { name: "Foam Rolling", sets: 1, duration: "10 min" },
          { name: "Hip Mobility", sets: 1, duration: "10 min" },
          { name: "Shoulder Mobility", sets: 1, duration: "10 min" },
          { name: "Deep Stretching", sets: 1, duration: "15 min" },
        ],
      },
    ],
    duration: 9 * 7,
    trainerIds: [],
  },
  {
    name: "Core Strength & Mobility",
    type: "popular",
    description:
      "A low-impact program targeting deep core stabilizers, spinal mobility, and postural correction. Suitable for all fitness levels including post-rehab individuals.",
    details:
      "Sessions are 45 minutes, 4 days per week. Exercises include dead bugs, pallof presses, bird dogs, plank variations, hollow body holds, and cat-camel stretches. Incorporates breathwork and diaphragmatic breathing techniques. Pairs well as an accessory program alongside any primary strength plan. No equipment required beyond a mat.",
    sessions: [
      {
        name: "Core Stability",
        exercises: [
          { name: "Dead Bug", sets: 3, reps: 15 },
          { name: "Bird Dog", sets: 3, reps: 12 },
          { name: "Front Plank", sets: 3, duration: "45 sec" },
          { name: "Side Plank", sets: 3, duration: "30 sec" },
          { name: "Pallof Press", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Mobility",
        exercises: [
          { name: "Cat Camel", sets: 3, reps: 15 },
          { name: "World's Greatest Stretch", sets: 2, reps: 8 },
          { name: "Hip Flexor Stretch", sets: 2, duration: "45 sec" },
          { name: "Thoracic Rotation", sets: 2, reps: 12 },
          { name: "Child Pose", sets: 2, duration: "1 min" },
        ],
      },
      {
        name: "Core Endurance",
        exercises: [
          { name: "Hollow Hold", sets: 3, duration: "30 sec" },
          { name: "Russian Twist", sets: 3, reps: 20 },
          { name: "Reverse Crunch", sets: 3, reps: 15 },
          { name: "Superman Hold", sets: 3, duration: "30 sec" },
          { name: "Bear Crawl", sets: 3, duration: "30 sec" },
        ],
      },
      {
        name: "Recovery Flow",
        exercises: [
          { name: "Foam Rolling", sets: 1, duration: "10 min" },
          { name: "Deep Breathing", sets: 1, duration: "5 min" },
          { name: "Yoga Flow", sets: 1, duration: "20 min" },
          { name: "Stretching", sets: 1, duration: "10 min" },
        ],
      },
    ],
    duration: 6 * 7,
    trainerIds: [],
  },
  {
    name: "Powerlifting Peaking Program",
    type: "popular",
    description:
      "A competition-style powerlifting program that peaks the squat, bench press, and deadlift for maximum 1-rep max performance at the end of the cycle.",
    details:
      "Based on percentage-based loading (65-95% of 1RM). Three primary training days built around the competition lifts. Accessory work targets weak points and supporting muscle groups. Intensity increases and volume decreases weekly as the peak approaches. Final week is a taper with opener attempts. Not recommended for beginners.",
    sessions: [
      {
        name: "Squat Day",
        exercises: [
          { name: "Competition Squat", sets: 5, reps: 3 },
          { name: "Pause Squat", sets: 3, reps: 5 },
          { name: "Leg Press", sets: 3, reps: 10 },
          { name: "Leg Curl", sets: 3, reps: 12 },
          { name: "Ab Wheel Rollout", sets: 3, reps: 12 },
        ],
      },
      {
        name: "Bench Day",
        exercises: [
          { name: "Competition Bench Press", sets: 5, reps: 3 },
          { name: "Close Grip Bench Press", sets: 3, reps: 5 },
          { name: "Incline Dumbbell Press", sets: 3, reps: 8 },
          { name: "Tricep Pushdown", sets: 3, reps: 15 },
          { name: "Face Pull", sets: 3, reps: 15 },
        ],
      },
      {
        name: "Deadlift Day",
        exercises: [
          { name: "Competition Deadlift", sets: 5, reps: 3 },
          { name: "Romanian Deadlift", sets: 3, reps: 8 },
          { name: "Barbell Row", sets: 3, reps: 10 },
          { name: "Pull Up", sets: 3, reps: 8 },
          { name: "Farmer Carry", sets: 3, duration: "45 sec" },
        ],
      },
    ],
    duration: 10 * 7,
    trainerIds: [],
  },
];

connectDB()
  .then(async () => {
    for (const gymPlan of popularGymPlans) {
      await GymPlan.findOneAndUpdate(
        {
          name: gymPlan.name,
        },
        {
          $set: gymPlan,
        },
        {
          upsert: true,
        },
      );
    }
    console.log("Popular Gym Plans seeded in database successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Popular Gym Plans seeding failed", error);
    process.exit(1);
  });
