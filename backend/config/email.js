import nodemailer from "nodemailer";

export const sendEmail = async (email, subject, text, html = "", attachments = [], replyTo = null) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER, // Set in .env
                pass: process.env.EMAIL_PASS  // Set in .env
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            text: text,
        };
        
        if (replyTo) mailOptions.replyTo = replyTo;
        if (html) mailOptions.html = html;
        if (attachments && attachments.length > 0) mailOptions.attachments = attachments;

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to", email);
    } catch (error) {
        console.error("Email not sent", error);
    }
}
