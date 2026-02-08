// const nodemailer = require("nodemailer");

// const sendEmail = async ({ to, subject, text }) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: `"EduCrit" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//   });
// };

// module.exports = sendEmail;

// const nodemailer = require("nodemailer");

// const sendEmail = async ({ to, subject, text }) => {
//   const transporter = nodemailer.createTransport({
//     service: "gmail",
//     host: "smtp.gmail.com",
//     port: 465,
//     secure: true, // Use SSL
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // 🟢 App Password here
//     },
//     connectionTimeout: 10000, // 10 seconds
//   });

//   // Verify connection configuration before sending
//   try {
//     await transporter.verify();
//     await transporter.sendMail({
//       from: `"EduCrit" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//     });
//   } catch (error) {
//     // This will show exactly why Gmail rejected the request in Render logs
//     console.error("Nodemailer Detail:", error.message);
//     throw error;
//   }
// };

// module.exports = sendEmail;

const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, text }) => {
  try {
    // 🟢 Keep this log to verify your key is loading locally
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY is missing in .env.development");
    }

    const response = await resend.emails.send({
      from: "EduCrit <otp@mail.educrit.in>",
      to: [to],
      subject: subject,
      text: text,
      reply_to: "educrit.app@gmail.com",
    });

    if (response.error) {
      // to check if the error is a Sandbox restriction
      console.error("Resend API Error:", response.error.message);
      throw new Error(response.error.message);
    }

    // To see the OTP in terminal if the email doesn't arrive
    console.log(`✅ Email sent to ${to}. Content: ${text}`);
    return response.data;
  } catch (error) {
    console.error("Resend Utility Error:", error.message);
    throw error;
  }
};

module.exports = sendEmail;
