import nodemailer from "nodemailer";

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@codevector.com",
      to: options.email,
      subject: options.subject,
      html: options.html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
    
    // Log the Ethereal URL when using testing credentials
    if (!process.env.SMTP_HOST || process.env.SMTP_HOST.includes("ethereal")) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email. Please try again later.");
  }
};
