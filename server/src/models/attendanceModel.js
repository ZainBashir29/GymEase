import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      enum: ["member", "trainer"],
    },
    status: {
      type: String,
      required: true,
      enum: ["present", "absent"],
      default: "present",
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model("Attendance", attendanceSchema);

export default Attendance;