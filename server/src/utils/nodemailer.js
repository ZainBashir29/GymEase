import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.NODEMAILER_HOST,
  port: process.env.NODEMAILER_PORT,
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

try {
  await transporter.verify();
  console.log("Server is ready to take our messages");
} catch (err) {
  console.error("Verification failed:", err);
}

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"GymEase" <${process.env.NODEMAILER_HOST}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Error while sending mail:", err);
  }
}

export default sendEmail;