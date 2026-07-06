import cron from "node-cron";
import warnExpiringMemberships from "./warnExpiringMemberships.js";
import expireMemberships from "./expireMemberships.js";
import markMissedSessions from "./markMissedSessions.js";
import completeFinishedMemberPlans from "./completeFinishedMemberPlans.js";
import reconcilePayments from "./reconcilePayments.js";

const runDailyBatch = async () => {
  console.log("Starting daily batch: ", new Date().toISOString);

  try {
    await warnExpiringMemberships();
    await expireMemberships();
    await markMissedSessions();
    await completeFinishedMemberPlans();

    console.log("Daily batch completed successfully");
  } catch (error) {
    console.log("Daily batch failed: ", error?.message);
  }
};

const startCronJobs = () => {
  cron.schedule("5 0 * * *", runDailyBatch);

  cron.schedule("0 */2 * * *", reconcilePayments);

  console.log("All cron jobs scheduled");
};

export default startCronJobs;
