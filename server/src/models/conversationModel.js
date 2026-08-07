import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.path("participants").validate(function (value) {
  return value.length === 2;
}, "Conversation must contain exactly two participants.");

conversationSchema.index({
  participants: 1,
});

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
