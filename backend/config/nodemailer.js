import nodemailer from 'nodemailer';

import dotenv from "dotenv";
dotenv.config({ path: "../.env" });


// Create a transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // ✅ Corrected Gmail SMTP host
  port: 587,
  secure: false, // ✅ Must be false for port 587
  auth: {
    user: process.env.USER, // Load from .env
    pass: process.env.APP_PASS, // Load from .env
  },
  tls: {
    rejectUnauthorized: false, // ✅ Helps prevent SSL issues
  },
});
const USER = "pk6850708@gmail.com"
// Set up email data


const sendEmail = async (to, subject, text, html) => {
    const mailOptions = {
      from: {
        name: 'CMS',
        address: process.env.USER, // Your 'from' address (configured via .env)
      },
      to, // `to` will be dynamically set from the user input email
      subject,
      text,
      html,
    };
  
    try {
      let info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      return true; // Email sent successfully
    } catch (error) {
      console.error('Error sending email:', error);
      return false; // Error sending email
    }
  };
  


export default transporter;
export { sendEmail };