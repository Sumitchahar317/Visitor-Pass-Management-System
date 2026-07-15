// utils/mailer.js

exports.sendMail = async (to, subject, html, attachments = []) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("Resend API key is not configured.");
    throw new Error("Resend API key is missing");
  }

  // Format attachments for Resend's API structure
  const formattedAttachments = attachments.map((att) => {
    let contentBase64 = "";
    if (Buffer.isBuffer(att.content)) {
      contentBase64 = att.content.toString("base64");
    } else if (typeof att.content === "string") {
      contentBase64 = att.content;
    }
    
    return {
      filename: att.filename,
      content: contentBase64,
      contentId: att.cid || att.contentId // Resend maps contentId to cid reference in HTML
    };
  });

  const payload = {
    from: process.env.EMAIL_FROM || "onboarding@resend.dev" ,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    attachments: formattedAttachments
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Resend API error response:", data);
      throw new Error(data.message || "Failed to send email via Resend API");
    }

    console.log("Email sent successfully via Resend API:", data.id);
    return data;

  } catch (error) {
    console.error("Resend API execution error:", error.message);
    throw error;
  }
};