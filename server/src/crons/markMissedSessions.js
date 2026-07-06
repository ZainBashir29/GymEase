import Session from "../models/gymPlans/sessionModel.js";

const markMissedSessions = async () => {
  const now = new Date();

  const startOfToday = new Date(now);

  startOfToday.setHours(0, 0, 0, 0);

  const updatedSessions = await Session.updateMany(
    {
      date: {
        $lt: startOfToday,
        status: "upcoming",
      },
    },
    {
      $set: {
        status: "missed",
      },
    },
  );

  console.log(`Marked ${updatedSessions.modifiedCount} session/s as missed`);
};

export default markMissedSessions;
