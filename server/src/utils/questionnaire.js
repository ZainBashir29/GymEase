const QUESTIONS = [
  {
    index: 0,
    question: "What is your primary fitness goal?",
    options: ["weight_loss", "muscle_gain", "endurance", "flexibility"],
  },
  {
    index: 1,
    question: "What is your current fitness level?",
    options: ["beginner", "intermediate", "advanced"],
  },
  {
    index: 2,
    question: "How many days per week can you train?",
    options: ["3", "4", "5", "6"],
  },
  {
    index: 3,
    question: "Which body area do you want to focus on?",
    options: ["upper_body", "lower_body", "full_body", "core"],
  },
];

const EXERCISE_POOLS = {
  upper_body: {
    weight_loss: [
      "Push-ups",
      "Dumbbell rows",
      "Shoulder press",
      "Tricep dips",
      "Resistance band pulls",
    ],
    muscle_gain: [
      "Bench press",
      "Pull-ups",
      "Barbell rows",
      "Overhead press",
      "Bicep curls",
    ],
    endurance: [
      "Battle ropes",
      "Box jumps",
      "Mountain climbers",
      "Burpees",
      "Jumping jacks",
    ],
    flexibility: [
      "Shoulder stretches",
      "Chest openers",
      "Neck rolls",
      "Upper back stretch",
      "Arm circles",
    ],
  },
  lower_body: {
    weight_loss: ["Squats", "Lunges", "Jump rope", "Step-ups", "Glute bridges"],
    muscle_gain: [
      "Barbell squats",
      "Deadlifts",
      "Leg press",
      "Calf raises",
      "Romanian deadlifts",
    ],
    endurance: [
      "Running",
      "Cycling",
      "Stair climber",
      "Jump squats",
      "Sled pushes",
    ],
    flexibility: [
      "Hip flexor stretch",
      "Hamstring stretch",
      "Quad stretch",
      "Calf stretch",
      "Pigeon pose",
    ],
  },
  full_body: {
    weight_loss: [
      "Burpees",
      "Jump rope",
      "Kettlebell swings",
      "Box jumps",
      "Thrusters",
    ],
    muscle_gain: [
      "Deadlifts",
      "Clean and press",
      "Thrusters",
      "Turkish get-ups",
      "Farmer carries",
    ],
    endurance: [
      "Circuit training",
      "HIIT",
      "Swimming",
      "Rowing",
      "Sandbag carries",
    ],
    flexibility: [
      "Yoga flow",
      "Dynamic stretching",
      "Foam rolling",
      "Pilates",
      "Sun salutations",
    ],
  },
  core: {
    weight_loss: [
      "Plank",
      "Russian twists",
      "Mountain climbers",
      "High knees",
      "Flutter kicks",
    ],
    muscle_gain: [
      "Cable crunches",
      "Hanging leg raises",
      "Ab wheel rollouts",
      "Weighted sit-ups",
      "Dragon flags",
    ],
    endurance: [
      "Plank holds",
      "Flutter kicks",
      "Bicycle crunches",
      "Dead bug",
      "V-ups",
    ],
    flexibility: [
      "Cat-cow stretch",
      "Childs pose",
      "Seated forward fold",
      "Spinal twist",
      "Cobra stretch",
    ],
  },
};
