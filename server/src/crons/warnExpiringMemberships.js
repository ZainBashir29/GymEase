import MembershipSubscription from "../models/membershipSubscriptionModel.js";
import sendEmail from "../services/nodemailer.js";
import { getExpiryReminderEmail } from "../utils/emailTemplates.js";

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
  })
    .populate("memberId", "fullName email")
    .populate("membershipPlanId", "name");

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

    try {
      const emailContent = getExpiryReminderEmail({
        userName: member.fullName || "there",
        planName: subscription.membershipPlanId?.name || "Membership",
        endDate: subscription.endDate,
      });
      await sendEmail({
        to: member.email,
        ...emailContent,
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
