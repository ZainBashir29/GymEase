export const getWelcomeMembershipEmail = (userName, amount) => ({
  subject: "Welcome to GymEase! Your Membership is Active",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4F46E5;">Welcome to GymEase, ${userName}!</h1>
      <p>Your membership has been successfully activated. We are thrilled to have you on board!</p>
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Payment Receipt</h3>
        <p><strong>Amount Paid:</strong> Rs. ${amount.toLocaleString()}</p>
        <p><strong>Status:</strong> Paid</p>
      </div>
      <p>Log in to your dashboard to view your gym plans and get started.</p>
      <p>Best regards,<br>The GymEase Team</p>
    </div>
  `
});

export const getRenewalMembershipEmail = (userName, amount) => ({
  subject: "GymEase Membership Update Receipt",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">Membership Updated</h2>
      <p>Hi ${userName},</p>
      <p>Your membership has been successfully updated/renewed.</p>
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Payment Summary</h3>
        <p><strong>Amount Paid:</strong> Rs. ${amount.toLocaleString()}</p>
        <p><strong>Status:</strong> Paid</p>
      </div>
      <p>Thank you for choosing GymEase!</p>
    </div>
  `
});

export const getStoreOrderEmail = (userName, amount, products) => {
  const itemsList = products.map(p => 
    `<li>${p.productId?.name} x ${p.quantity}</li>`
  ).join("");

  return {
    subject: "GymEase Store - Order Confirmation",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Order Confirmed!</h2>
        <p>Hi ${userName},</p>
        <p>Thank you for your purchase from the GymEase Store. Your order is now processing.</p>
        
        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Summary</h3>
          <ul style="margin-bottom: 15px;">
            ${itemsList}
          </ul>
          <p><strong>Total Amount Paid:</strong> Rs. ${amount.toLocaleString()}</p>
        </div>
        
        <p>We'll notify you when your items are ready!</p>
        <p>Best regards,<br>The GymEase Team</p>
      </div>
    `
  };
};

export const getCancellationEmail = (userName) => ({
  subject: "GymEase Membership Cancelled",
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #4F46E5;">We're Sorry to See You Go</h2>
      <p>Hi ${userName},</p>
      <p>Your membership has been successfully cancelled as per your request.</p>
      <p>We completely respect your decision, but we'll miss having you at GymEase! If you ever decide to continue your fitness journey with us in the future, your account will be right here waiting for you.</p>
      <p>We hope to see you back soon!</p>
      <p>Best regards,<br>The GymEase Team</p>
    </div>
  `
});
