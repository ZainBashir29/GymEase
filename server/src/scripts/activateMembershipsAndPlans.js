import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

import connectDB from "../db/index.js";
import Member from "../models/memberModel.js";
import Trainer from "../models/trainerModel.js";
import MembershipPlan from "../models/membershipPlanModel.js";
import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import Payment from "../models/paymentModel.js";
import GymPlan from "../models/gymPlans/gymPlanModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import Session from "../models/gymPlans/sessionModel.js";
import ProgressData from "../models/progressDataModel.js";

const TARGET_EMAILS = [
  "two@two.com",
  "three@three.com",
  "malik123@gmail.com",
  "tonystark@gmail.com",
];

const MEMBERSHIP_TIER_NAMES = ["Basic", "Standard", "Premium"];

const getValidDaysOfWeek = (frequency) => {
  if (frequency <= 2) return [1, 4];
  if (frequency === 3) return [1, 3, 5];
  if (frequency === 4) return [1, 2, 4, 5];
  if (frequency === 5) return [1, 2, 3, 4, 5];
  return [1, 2, 3, 4, 5, 6];
};

const findAvailableTrainer = async (allowedTrainers, targetDate, session) => {
  if (!allowedTrainers || allowedTrainers.length === 0) return null;

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  let bestTrainer = allowedTrainers[0];
  let minSessions = Infinity;

  for (const trainerId of allowedTrainers) {
    const sessionCount = await Session.countDocuments({
      trainerId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    }).session(session);

    if (sessionCount < 3) {
      return trainerId;
    }

    if (sessionCount < minSessions) {
      minSessions = sessionCount;
      bestTrainer = trainerId;
    }
  }

  return bestTrainer;
};

const activateMembershipForMember = async (member, membershipPlan, session) => {
  await MembershipSubscription.deleteMany(
    { memberId: member._id, status: "pending" },
    { session },
  );

  await MembershipSubscription.updateMany(
    { memberId: member._id, status: "active" },
    { $set: { status: "cancelled" } },
    { session },
  );

  const startDate = new Date();
  const durationDays = membershipPlan.duration || 30;
  const endDate = new Date(
    startDate.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );

  const [payment] = await Payment.create(
    [
      {
        memberId: member._id,
        type: "MembershipSubscription",
        membershipPaymentType: "new_membership",
        paymentCauseId: membershipPlan._id,
        amount: membershipPlan.price,
        status: "successful",
        trackerToken: `script_seed_${member._id}_${Date.now()}`,
      },
    ],
    { session },
  );

  const [subscription] = await MembershipSubscription.create(
    [
      {
        membershipPlanId: membershipPlan._id,
        memberId: member._id,
        startDate,
        endDate,
        status: "active",
        paymentId: payment._id,
      },
    ],
    { session },
  );

  return subscription;
};

const activateGymPlanForMember = async (
  member,
  gymPlan,
  membershipPlan,
  session,
) => {
  const existingPlans = await MemberPlan.find({
    memberId: member._id,
    status: { $in: ["active", "paused"] },
  }).session(session);

  if (existingPlans.length > 0) {
    const existingPlanIds = existingPlans.map((p) => p._id);
    await MemberPlan.updateMany(
      { _id: { $in: existingPlanIds } },
      { $set: { status: "cancelled" } },
      { session },
    );
    await Session.deleteMany(
      { memberPlanId: { $in: existingPlanIds }, status: "upcoming" },
      { session },
    );
  }

  const maxTrainers = membershipPlan?.maxTrainers || 1;

  let validTrainers = await Trainer.find({
    _id: { $in: gymPlan.trainerIds || [] },
    isActive: true,
  }).session(session);

  if (validTrainers.length < maxTrainers) {
    const existingIds = validTrainers.map((t) => t._id);
    const additionalTrainers = await Trainer.find({
      isActive: true,
      _id: { $nin: existingIds },
    })
      .limit(maxTrainers - validTrainers.length)
      .session(session);
    validTrainers = [...validTrainers, ...additionalTrainers];
  }

  if (validTrainers.length === 0) {
    throw new Error("No active trainers are currently available in the system");
  }

  const allowedTrainers = validTrainers
    .slice(0, maxTrainers)
    .map((trainer) => trainer._id);

  const startDate = new Date();
  const workouts = gymPlan.sessions || [];

  const [memberPlan] = await MemberPlan.create(
    [
      {
        gymPlanId: gymPlan._id,
        memberId: member._id,
        duration: gymPlan.duration,
        startDate,
        status: "active",
      },
    ],
    { session },
  );

  const validDays = getValidDaysOfWeek(workouts.length);
  const sessionDocuments = [];
  let workoutIndex = 0;
  let dayCounter = 1;

  for (let i = 0; i < gymPlan.duration; i++) {
    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + i);

    if (validDays.includes(targetDate.getDay()) && workouts.length > 0) {
      const rotatedTrainers = [
        ...allowedTrainers.slice(workoutIndex % allowedTrainers.length),
        ...allowedTrainers.slice(0, workoutIndex % allowedTrainers.length),
      ];

      const trainerId = await findAvailableTrainer(
        rotatedTrainers,
        targetDate,
        session,
      );

      if (!trainerId) {
        throw new Error(
          `No trainer is available on date ${targetDate.toDateString()}`,
        );
      }

      const workout = workouts[workoutIndex % workouts.length];

      sessionDocuments.push({
        memberPlanId: memberPlan._id,
        memberId: member._id,
        trainerId,
        workoutName: workout.name,
        exercises: workout.exercises,
        day: dayCounter++,
        date: targetDate,
        status: "upcoming",
      });

      workoutIndex++;
    }
  }

  const sessions = await Session.insertMany(sessionDocuments, { session });
  const firstSessionTrainerId =
    sessionDocuments[0]?.trainerId || allowedTrainers[0];

  const [progressData] = await ProgressData.create(
    [
      {
        memberPlanId: memberPlan._id,
        memberId: member._id,
        trainerId: firstSessionTrainerId,
        remainingDays: gymPlan.duration,
        completedSessions: 0,
      },
    ],
    { session },
  );

  return { memberPlan, sessionsCount: sessions.length, progressData };
};

const run = async () => {
  try {
    await connectDB();

    const membershipPlans = await MembershipPlan.find({
      name: {
        $in: MEMBERSHIP_TIER_NAMES.map((name) => new RegExp(`^${name}$`, "i")),
      },
      isActive: { $ne: false },
    });

    if (membershipPlans.length === 0) {
      console.error(
        "No active Basic, Standard, or Premium membership plans found in the database.",
      );
      process.exit(1);
    }

    const availableGymPlans = await GymPlan.find({
      type: "popular",
      isActive: { $ne: false },
    });

    if (availableGymPlans.length === 0) {
      console.error("No available gym plans found in the database.");
      process.exit(1);
    }

    const members = await Member.find({
      email: { $in: TARGET_EMAILS.map((e) => e.toLowerCase().trim()) },
    });

    const foundEmails = new Set(members.map((m) => m.email.toLowerCase()));
    for (const email of TARGET_EMAILS) {
      if (!foundEmails.has(email.toLowerCase())) {
        console.warn(`Member with email "${email}" was not found.`);
      }
    }

    if (members.length === 0) {
      console.log("No matching members found. Exiting.");
      process.exit(0);
    }

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const chosenMembershipPlan =
        membershipPlans[i % membershipPlans.length];
      const chosenGymPlan = availableGymPlans[i % availableGymPlans.length];

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const subscription = await activateMembershipForMember(
          member,
          chosenMembershipPlan,
          session,
        );

        const { memberPlan, sessionsCount } = await activateGymPlanForMember(
          member,
          chosenGymPlan,
          chosenMembershipPlan,
          session,
        );

        await session.commitTransaction();

        console.log(
          `[SUCCESS] ${member.fullName} (${member.email}):\n` +
            `  -> Membership Activated: ${chosenMembershipPlan.name} (valid until ${subscription.endDate.toDateString()})\n` +
            `  -> Gym Plan Activated: "${chosenGymPlan.name}" (${sessionsCount} sessions scheduled, MemberPlan ID: ${memberPlan._id})`,
        );
      } catch (err) {
        await session.abortTransaction();
        console.error(
          `[FAILED] Could not activate plans for ${member.email}:`,
          err.message,
        );
      } finally {
        session.endSession();
      }
    }

    console.log("Script finished successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Script execution failed:", error);
    process.exit(1);
  }
};

run();
