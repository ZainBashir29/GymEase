import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "GymEase Team <gymease1@gmail.com>",
      to: typeof to === 'string' ? [to] : to,
      subject: subject,
      html: html,
      text,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw error;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (err) {
    console.error("Error while sending email via Resend:", err);
    throw err;
  }
};

export default sendEmail;
