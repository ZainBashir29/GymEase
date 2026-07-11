import MemberPlan from "../models/gymPlans/memberPlanModel";
import Session from "../models/gymPlans/sessionModel.js";

const completeFinishedMemberPlans = async () => {
  const activePlans = await MemberPlan.find({
    status: "active",
  });

  if (activePlans.length == 0) {
    console.log("No active member plans to check");
  }

  let completedMemberPlans = 0;

  for (const memberPlan of activePlans) {
    const upcomingSessions = await Session.countDocuments({
      memberPlanId: memberPlan._id,
      status: "upcoming",
    });

    if (upcomingSessions == 0) {
      memberPlan.status = "completed";
      await memberPlan.save({ validateBeforeSave: false });
      completedMemberPlans++;
    }
  }

  console.log(`Marked ${completedMemberPlans} member plans as complete`);
};

export default completeFinishedMemberPlans;
