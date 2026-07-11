import mongoose from "mongoose";

const questionnaireResponseSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    answers: [
      {
        type: String,
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

const QuestionnaireResponse = mongoose.model(
  "QuestionnaireResponse",
  questionnaireResponseSchema,
);

export default QuestionnaireResponse;
