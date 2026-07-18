const dotenv = require("dotenv")

dotenv.config();

const TEXTBELT_API_KEY = process.env.TEXTBELT_API_KEY;
/**
 *  to - The recipient's phone number (e.g., +15555555555).
 *  body - The text message body.
 * returns {Promise<object>} The Textbelt API response.
 */
async function sendSMS(to, body) {
  if (!TEXTBELT_API_KEY) {
    console.log(`[SMS Mock] Send to ${to}: ${body}`);
    return { success: true, message: "Mock message sent" };
  }
  try {
    const response = await fetch("https://textbelt.com/text", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: to,
        message: body,
        key: TEXTBELT_API_KEY,
      }),
    });
    
    const data = await response.json();
    if (data.success) {
      console.log(`[SMS] Message sent successfully to ${to}. Remaining quota: ${data.quotaRemaining}`);
      return data;
    } else {
      throw new Error(data.error);
    }
  } catch (err) {
    console.error(`[SMS Error] Failed to send message: ${err.message}`);
    throw err;
  }
}
module.exports = { sendSMS };