import ApiError from "../utils/ApiError.js";

const questions = [
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

const session_templates = {
  upper_body: {
    weight_loss: [
      {
        name: "Upper Body Burn",
        exercises: [
          { name: "Push-ups", sets: 3, reps: 15, duration: null },
          { name: "Resistance band pulls", sets: 3, reps: 12, duration: null },
          { name: "Shoulder press", sets: 3, reps: 12, duration: null },
        ],
      },
      {
        name: "Upper Body Circuit",
        exercises: [
          { name: "Tricep dips", sets: 3, reps: 15, duration: null },
          { name: "Dumbbell rows", sets: 3, reps: 12, duration: null },
          { name: "Mountain climbers", sets: 3, reps: null, duration: "45s" },
        ],
      },
    ],
    muscle_gain: [
      {
        name: "Chest & Triceps",
        exercises: [
          { name: "Bench press", sets: 4, reps: 8, duration: null },
          { name: "Overhead press", sets: 4, reps: 8, duration: null },
          { name: "Tricep dips", sets: 3, reps: 10, duration: null },
        ],
      },
      {
        name: "Back & Biceps",
        exercises: [
          { name: "Pull-ups", sets: 4, reps: 8, duration: null },
          { name: "Barbell rows", sets: 4, reps: 8, duration: null },
          { name: "Bicep curls", sets: 3, reps: 10, duration: null },
        ],
      },
    ],
    endurance: [
      {
        name: "Upper Body Conditioning",
        exercises: [
          { name: "Battle ropes", sets: 4, reps: null, duration: "30s" },
          { name: "Burpees", sets: 4, reps: 10, duration: null },
          { name: "Jumping jacks", sets: 3, reps: null, duration: "60s" },
        ],
      },
    ],
    flexibility: [
      {
        name: "Upper Body Mobility",
        exercises: [
          { name: "Shoulder stretches", sets: 2, reps: null, duration: "30s" },
          { name: "Chest openers", sets: 2, reps: null, duration: "30s" },
          { name: "Arm circles", sets: 2, reps: 15, duration: null },
        ],
      },
    ],
  },

  lower_body: {
    weight_loss: [
      {
        name: "Leg Burn",
        exercises: [
          { name: "Squats", sets: 3, reps: 15, duration: null },
          { name: "Lunges", sets: 3, reps: 12, duration: null },
          { name: "Jump rope", sets: 3, reps: null, duration: "60s" },
        ],
      },
    ],
    muscle_gain: [
      {
        name: "Leg Day",
        exercises: [
          { name: "Barbell squats", sets: 4, reps: 8, duration: null },
          { name: "Deadlifts", sets: 4, reps: 6, duration: null },
          { name: "Calf raises", sets: 3, reps: 15, duration: null },
        ],
      },
    ],
    endurance: [
      {
        name: "Leg Conditioning",
        exercises: [
          { name: "Running", sets: 1, reps: null, duration: "20min" },
          { name: "Jump squats", sets: 4, reps: 12, duration: null },
          { name: "Stair climber", sets: 1, reps: null, duration: "10min" },
        ],
      },
    ],
    flexibility: [
      {
        name: "Lower Body Stretch",
        exercises: [
          { name: "Hamstring stretch", sets: 2, reps: null, duration: "30s" },
          { name: "Hip flexor stretch", sets: 2, reps: null, duration: "30s" },
          { name: "Quad stretch", sets: 2, reps: null, duration: "30s" },
        ],
      },
    ],
  },

  full_body: {
    weight_loss: [
      {
        name: "Full Body Blast",
        exercises: [
          { name: "Burpees", sets: 3, reps: 12, duration: null },
          { name: "Kettlebell swings", sets: 3, reps: 15, duration: null },
          { name: "Jump rope", sets: 3, reps: null, duration: "60s" },
        ],
      },
    ],
    muscle_gain: [
      {
        name: "Full Body Strength",
        exercises: [
          { name: "Deadlifts", sets: 4, reps: 6, duration: null },
          { name: "Clean and press", sets: 4, reps: 6, duration: null },
          { name: "Farmer carries", sets: 3, reps: null, duration: "40s" },
        ],
      },
    ],
    endurance: [
      {
        name: "Full Body Circuit",
        exercises: [
          { name: "HIIT circuit", sets: 5, reps: null, duration: "30s" },
          { name: "Rowing", sets: 1, reps: null, duration: "10min" },
          { name: "Sandbag carries", sets: 3, reps: null, duration: "40s" },
        ],
      },
    ],
    flexibility: [
      {
        name: "Full Body Flow",
        exercises: [
          { name: "Yoga flow", sets: 1, reps: null, duration: "20min" },
          { name: "Foam rolling", sets: 1, reps: null, duration: "10min" },
        ],
      },
    ],
  },

  core: {
    weight_loss: [
      {
        name: "Core Burn",
        exercises: [
          { name: "Plank", sets: 3, reps: null, duration: "45s" },
          { name: "Russian twists", sets: 3, reps: 20, duration: null },
          { name: "Mountain climbers", sets: 3, reps: null, duration: "45s" },
        ],
      },
    ],
    muscle_gain: [
      {
        name: "Core Strength",
        exercises: [
          { name: "Hanging leg raises", sets: 4, reps: 10, duration: null },
          { name: "Cable crunches", sets: 4, reps: 12, duration: null },
          { name: "Weighted sit-ups", sets: 3, reps: 12, duration: null },
        ],
      },
    ],
    endurance: [
      {
        name: "Core Conditioning",
        exercises: [
          { name: "Plank holds", sets: 3, reps: null, duration: "60s" },
          { name: "Bicycle crunches", sets: 3, reps: 20, duration: null },
          { name: "V-ups", sets: 3, reps: 15, duration: null },
        ],
      },
    ],
    flexibility: [
      {
        name: "Core Mobility",
        exercises: [
          { name: "Cat-cow stretch", sets: 2, reps: 10, duration: null },
          { name: "Spinal twist", sets: 2, reps: null, duration: "30s" },
          { name: "Childs pose", sets: 1, reps: null, duration: "45s" },
        ],
      },
    ],
  },
};

const validateAnswers = (answers) => {
  if (!Array.isArray(answers)) {
    throw new ApiError(400, "Answers must be an array");
  }

  if (answers.length != questions.length) {
    throw new ApiError(
      400,
      "The count of answers must be equal to the questions",
    );
  }

  for (const question of questions) {
    const answer = answers[question.index];
    if (!question.options.includes(answer)) {
      throw new ApiError(
        400,
        `Invalid answer ${answer} of question ${question.index + 1}`,
      );
    }
  }

  return "The answers are valid";
};

const generateCustomPlan = (answers) => {
  const [goal, level, daysPerWeek, focusArea] = answers;

  const totalSessions = parseInt(daysPerWeek) * 4;
  const duration = 28;

  const templatePool = session_templates[focusArea][goal];

  const sessions = [];

  for (let i = 0; i < totalSessions; i++) {
    const template = templatePool[i % templatePool.length];

    const levelMultiplier =
      level === "advanced" ? 1.2 : level === "intermediate" ? 1.0 : 0.85;

    sessions.push({
      name: template.name,
      exercises: template.exercises.map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets
          ? Math.max(
              2,
              Math.min(6, Math.round(exercise.sets * levelMultiplier)),
            )
          : null,
        reps: exercise.reps
          ? Math.max(
              6,
              Math.min(25, Math.round(exercise.reps * levelMultiplier)),
            )
          : null,
        duration: exercise.duration,
      })),
    });
  }

  const formatWord = (str) =>
    str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  const name = `${formatWord(goal)} - ${formatWord(focusArea)} (${level.charAt(0).toUpperCase() + level.slice(1)}) (Custom)`;

  const description = `A personalized ${level}-level plan focused on ${formatWord(goal)}, targeting ${formatWord(focusArea)}.`;

  const details = `This plan runs for ${totalSessions} sessions over 4 weeks, training ${daysPerWeek} days per week. Designed for ${level} level members.`;

  return {
    name,
    type: "custom",
    description,
    details,
    sessions,
    duration,
    trainerIds: [],
  };
};

export { questions, validateAnswers, generateCustomPlan };
