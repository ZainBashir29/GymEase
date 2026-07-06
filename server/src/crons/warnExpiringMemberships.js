import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import sendEmail from "../utils/nodemailer.js";

const days = 3;

const warnExpiringMemberships = async () => {
  const targetDate = new Date();

  targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(0, 0, 0, 0);

  const endOfTargetDay = new Date(targetDate);
  endOfTargetDay.setHours(23, 59, 59, 999);

  const expiringSubscriptions = await MembershipSubscription.find({
    endDate: { $gte: targetDate, $lte: endOfTargetDay },
    status: "active",
  }).populate("memberId", "fullName email");

  if (expiringSubscriptions.length === 0) {
    console.log("No memberships expiring in 3 days");
    return;
  }

  for (const subscription of expiringSubscriptions) {
    const member = subscription.memberId;

    if (!member?.email) {
      console.error(`Subscription ${subscription._id} has no member email`);
      continue;
    }

    const formattedDate = subscription.endDate.toDateString();

    try {
      await sendEmail({
        to: member.email,
        subject: "Your GymEase membership is expiring soon",
        html: `
          <p>Hi ${member.fullName || "there"},</p>
          <p>Your GymEase membership is set to expire on <strong>${formattedDate}</strong>.</p>
          <p>To avoid any interruption to your gym access, gym plans, and sessions, please renew your membership before it expires.</p>
          <p>You can renew anytime from your dashboard.</p>
          <p>- The GymEase Team</p>
        `,
      });

      console.log(`Warning email sent to ${member.email}`);
    } catch (error) {
      console.error(
        `Failed to send warning email to ${member.email}:`,
        error.message,
      );
    }
  }
};

export default warnExpiringMemberships;
