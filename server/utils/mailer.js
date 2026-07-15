// utils/mailer.js
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true only for port 465; port 587 uses STARTTLS instead
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

exports.sendMail = async (to, subject, html, attachments = []) => {
  await transporter.sendMail({
    from: `"Visitor Pass System" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
    attachments,
  });
};