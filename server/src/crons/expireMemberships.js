import MembershipSubscription from "../models/membershipSubscriptionModel.js";

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

  await MembershipSubscription.updateMany(
    { _id: { $in: subscriptionIds } },
    { $set: { status: "expired" } },
  );

  console.log(`Expired ${expiredSubscriptions.length} subscription/s`);
};

export default expireMemberships;
