import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to: options.email,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error("Resend API Error:", error);
      throw new Error(`Could not send email: ${error.message}`);
    }

    console.log("Email sent successfully via Resend!", data);
    return data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Could not send email. Please try again later.");
  }
};
