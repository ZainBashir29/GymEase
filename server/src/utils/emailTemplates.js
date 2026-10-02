const supportEmail = "gymease1@gmail.com";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));

const emailLayout = ({ title, preview, body }) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,sans-serif;color:#374151;">
      <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preview)}</span>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f5f7;padding:32px 16px;">
        <tr><td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;">
            <tr><td style="background:#4f46e5;padding:20px 32px;color:#fff;font-size:22px;font-weight:700;">GymEase</td></tr>
            <tr><td style="padding:32px;font-size:15px;line-height:1.6;">${body}</td></tr>
            <tr><td style="padding:20px 32px;background:#f9fafb;color:#6b7280;font-size:12px;line-height:1.5;">Questions? Contact <a href="mailto:${supportEmail}" style="color:#4f46e5;">${supportEmail}</a>.<br />This is a transactional GymEase email.</td></tr>
          </table>
        </td></tr>
      </table>
    </body>
  </html>`;

const receiptRows = (rows) =>
  rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 0;color:#6b7280;">${escapeHtml(label)}</td><td align="right" style="padding:8px 0;color:#111827;font-weight:600;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

export const getMembershipReceiptEmail = ({
  userName,
  amount,
  paymentId,
  planName,
  startDate,
  endDate,
  membershipEvent,
  previousPlanName,
}) => {
  const events = {
    first_purchase: {
      subject: `Welcome to GymEase: ${planName} membership active`,
      heading: "Welcome to GymEase",
      summary: `Your ${planName} membership is now active.`,
    },
    returning_member: {
      subject: `Welcome back to GymEase: ${planName} membership active`,
      heading: "Welcome back to GymEase",
      summary: `Your ${planName} membership is active again.`,
    },
    plan_changed: {
      subject: `GymEase membership plan changed to ${planName}`,
      heading: "Membership plan changed",
      summary: `Your membership has changed from ${previousPlanName} to ${planName}.`,
    },
    renewed: {
      subject: `GymEase membership renewed: ${planName}`,
      heading: "Membership renewed",
      summary: `Your ${planName} membership has been renewed.`,
    },
  };
  const event = events[membershipEvent] || events.first_purchase;
  const rows = [
    ["Plan", planName],
    ...(membershipEvent === "plan_changed"
      ? [["Previous plan", previousPlanName]]
      : []),
    ["Amount paid", formatAmount(amount)],
    ["Payment status", "Paid"],
    ["Payment reference", paymentId],
    ["Membership starts", formatDate(startDate)],
    ["Membership expires", formatDate(endDate)],
  ];

  return {
    subject: event.subject,
    text: `Hi ${userName},\n\n${event.summary}\nAmount paid: ${formatAmount(amount)}\nPayment status: Paid\nPayment reference: ${paymentId}\nMembership starts: ${formatDate(startDate)}\nMembership expires: ${formatDate(endDate)}\n\nYou can manage your membership from your GymEase dashboard.\n\nGymEase Support: ${supportEmail}`,
    html: emailLayout({
      title: event.heading,
      preview: `Your ${planName} membership is active until ${formatDate(endDate)}.`,
      body: `<h1 style="margin:0 0 12px;color:#111827;font-size:24px;">${event.heading}</h1>
        <p style="margin:0 0 20px;">Hi ${escapeHtml(userName)}, ${escapeHtml(event.summary)}</p>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin:20px 0;">${receiptRows(rows)}</table>
        <p style="margin:0;">You can manage your membership from your GymEase dashboard.</p>`,
    }),
  };
};

export const getStoreOrderEmail = ({ userName, amount, paymentId, order }) => {
  const items = order.products
    .map(
      (item) =>
        `<li style="margin:0 0 6px;">${escapeHtml(item.productId?.name || "Product")} &times; ${escapeHtml(item.quantity)}</li>`,
    )
    .join("");
  const itemText = order.products
    .map((item) => `${item.productId?.name || "Product"} x ${item.quantity}`)
    .join(", ");
  const rows = [
    ["Order number", order._id],
    ["Order date", formatDate(order.createdAt)],
    ["Order status", "Processing"],
    ["Payment status", "Paid"],
    ["Payment reference", paymentId],
    ["Total paid", formatAmount(amount)],
  ];

  return {
    subject: `GymEase order confirmed: #${order._id}`,
    text: `Hi ${userName},\n\nYour order #${order._id} has been confirmed and is now processing.\nItems: ${itemText}\nOrder date: ${formatDate(order.createdAt)}\nPayment status: Paid\nPayment reference: ${paymentId}\nTotal paid: ${formatAmount(amount)}\n\nWe will email you when the order status changes.\n\nGymEase Support: ${supportEmail}`,
    html: emailLayout({
      title: "Order confirmed",
      preview: `Your order #${order._id} has been paid and is processing.`,
      body: `<h1 style="margin:0 0 12px;color:#111827;font-size:24px;">Order confirmed</h1>
        <p style="margin:0 0 20px;">Hi ${escapeHtml(userName)}, we have received your payment. Your order is now <strong>Processing</strong>.</p>
        <h2 style="font-size:16px;color:#111827;margin:0 0 8px;">Items ordered</h2>
        <ul style="margin:0 0 20px;padding-left:20px;">${items}</ul>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-top:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;margin:20px 0;">${receiptRows(rows)}</table>
        <p style="margin:0;">We will email you when the order status changes.</p>`,
    }),
  };
};

export const getCancellationEmail = ({ userName, planName, cancelledAt }) => ({
  subject: `GymEase membership cancelled: ${planName}`,
  text: `Hi ${userName},\n\nYour ${planName} membership was cancelled on ${formatDate(cancelledAt)}. Your GymEase membership access has ended and no renewal payment was taken.\n\nIf this was not requested by you, contact ${supportEmail}.`,
  html: emailLayout({
    title: "Membership cancelled",
    preview: `Your ${planName} membership has been cancelled.`,
    body: `<h1 style="margin:0 0 12px;color:#111827;font-size:24px;">Membership cancelled</h1>
      <p>Hi ${escapeHtml(userName)}, your <strong>${escapeHtml(planName)}</strong> membership was cancelled on <strong>${escapeHtml(formatDate(cancelledAt))}</strong>.</p>
      <p>Your GymEase membership access has ended and no renewal payment was taken.</p>
      <p style="margin-bottom:0;">If you did not request this cancellation, contact us immediately at <a href="mailto:${supportEmail}" style="color:#4f46e5;">${supportEmail}</a>.</p>`,
  }),
});

export const getExpiryReminderEmail = ({ userName, planName, endDate }) => ({
  subject: `Action needed: ${planName} membership expires ${formatDate(endDate)}`,
  text: `Hi ${userName},\n\nYour ${planName} membership expires on ${formatDate(endDate)}. Renew before this date to keep access to GymEase, your gym plans, and sessions without interruption.\n\nGymEase Support: ${supportEmail}`,
  html: emailLayout({
    title: "Membership expiry reminder",
    preview: `Your ${planName} membership expires on ${formatDate(endDate)}.`,
    body: `<h1 style="margin:0 0 12px;color:#111827;font-size:24px;">Your membership expires soon</h1>
      <p>Hi ${escapeHtml(userName)}, your <strong>${escapeHtml(planName)}</strong> membership expires on <strong>${escapeHtml(formatDate(endDate))}</strong>.</p>
      <p>Renew before that date to keep access to GymEase, your gym plans, and sessions without interruption.</p>
      <p style="margin-bottom:0;">You can renew from your GymEase dashboard.</p>`,
  }),
});
