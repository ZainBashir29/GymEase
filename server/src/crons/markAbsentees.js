import Session from "../models/gyPlans/sessionModel.js";
import Attendance from "../models/attendanceModel.js";

const markAbsentees = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const todaysSessions = await Session.find({
    date: { $gte: startOfToday, $lte: endOfToday },
  }).select("memberId trainerId");

  if (todaysSessions.length === 0) {
    console.log("No sessions scheduled today to check for absentees.");
    return;
  }

  const roleMap = new Map();

  for (const session of todaysSessions) {
    roleMap.set(session.memberId.toString(), "member");
    roleMap.set(session.trainerId.toString(), "trainer");
  }

  const alreadyMarked = await Attendance.find({
    date: { $gte: startOfToday, $lte: endOfToday },
  }).select("userId");

  const alreadyMarkedIds = new Set(
    alreadyMarked.map((attendance) => attendance.userId.toString()),
  );

  const absenteesToInsert = [];

  for (const [userId, role] of roleMap.entries()) {
    if (!alreadyMarkedIds.has(userId)) {
      absenteesToInsert.push({
        userId,
        role,
        status: "absent",
        date: new Date(),
      });
    }
  }

  if (absenteesToInsert.length === 0) {
    console.log("Everyone expected today already marked attendance.");
    return;
  }

  const result = await Attendance.insertMany(absenteesToInsert, {
    ordered: false,
  }).catch((err) => {
    console.log(
      `Some inserts skipped due to unexpected race condition, ${err.message}`,
    );
  });

  console.log(`Marked ${absenteesToInsert.length} absentees for today.`);
};

export default markAbsentees;
