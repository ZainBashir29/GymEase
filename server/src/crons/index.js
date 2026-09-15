import cron from "node-cron";
import warnExpiringMemberships from "./warnExpiringMemberships.js";
import expireMemberships from "./expireMemberships.js";
import markMissedSessions from "./markMissedSessions.js";
import completeFinishedMemberPlans from "./completeFinishedMemberPlans.js";
import reconcilePayments from "./reconcilePayments.js";
import markAbsentees from "./markAbsentees.js";

const runDailyBatch = async () => {
  console.log("Starting daily batch: ", new Date().toISOString());

  try {
    await warnExpiringMemberships();
  } catch (error) {
    console.error("warnExpiringMemberships failed: ", error?.message);
  }

  try {
    await expireMemberships();
  } catch (error) {
    console.error("expireMemberships failed: ", error?.message);
  }

  try {
    await markMissedSessions();
  } catch (error) {
    console.error("markMissedSessions failed: ", error?.message);
  }

  try {
    await completeFinishedMemberPlans();
  } catch (error) {
    console.error("completeFinishedMemberPlans failed: ", error?.message);
  }

  console.log("Daily batch execution completed.");
};

const startCronJobs = () => {
  cron.schedule("5 0 * * *", runDailyBatch);

  cron.schedule("0 */2 * * *", async () => {
    try {
      await reconcilePayments();
    } catch (error) {
      console.error("reconcilePayments failed:", error);
    }
  });

  cron.schedule("55 23 * * *", async () => {
    try {
      await markAbsentees();
    } catch (error) {
      console.error("markAbsentees failed:", error);
    }
  });

  console.log("All cron jobs scheduled");
};

export default startCronJobs;
