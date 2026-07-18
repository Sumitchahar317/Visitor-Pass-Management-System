const nodemailer = require("nodemailer");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: false, // true only for port 465; port 587 uses STARTTLS instead
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendMail = async (to, subject, html, attachments = []) => {
  try {
    console.log(`[mailer] Sending email to ${to} with subject "${subject}"...`);
    const info = await transporter.sendMail({
      from: `"Visitor Pass System" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      attachments,
    });
    console.log(`[mailer] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[mailer] Error occurred while sending email to ${to}:`, error);
    throw error;
  }
};