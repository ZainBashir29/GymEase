import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import MemberPlan from "../models/gymPlans/memberPlanModel.js";
import Session from "../models/gymPlans/sessionModel.js";

const expireMemberships = async () => {
  const now = new Date();

  const expiredSubscriptions = await MembershipSubscription.find({
    endDate: { $lt: now },
    status: "active",
  });

  if (expiredSubscriptions.length == 0) {
    console.log("No memberships to expire");
    return;
  }

  const subscriptionIds = expiredSubscriptions.map(
    (subscription) => subscription._id,
  );

  const memberIds = expiredSubscriptions.map(
    (subscription) => subscription.memberId,
  );

  await MembershipSubscription.updateMany(
    { _id: { $in: subscriptionIds } },
    { $set: { status: "expired" } },
  );

  const activePlans = await MemberPlan.find({
    memberId: { $in: memberIds },
    status: "active",
  });

  if (activePlans.length > 0) {
    const activePlanIds = activePlans.map((plan) => plan._id);

    await MemberPlan.updateMany(
      { _id: { $in: activePlanIds } },
      { $set: { status: "paused" } }
    );

    const deletedSessions = await Session.deleteMany({
      memberPlanId: { $in: activePlanIds },
      status: "upcoming",
    });

    console.log(`Paused ${activePlans.length} gym plans and cleared ${deletedSessions.deletedCount} upcoming sessions`);
  }

  console.log(`Expired ${expiredSubscriptions.length} subscription/s`);
};

export default expireMemberships;
