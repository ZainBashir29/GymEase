import mongoose from "mongoose";

const gymPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["popular", "custom"],
    },
    description: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      required: true,
    },
    exercises: [
      {
        name: String,
        exercises: {
          name: String,
          sets: Number,
          reps: Number,
          duration: String,
        },
      },
    ],
    duration: {
      type: Number,
      required: true,
    },
    trainerIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Trainer",
      },
    ],
  },
  {
    timestamps: true,
  },
);

const GymPlan = mongoose.model("GymPlan", gymPlanSchema);

export default GymPlan;
