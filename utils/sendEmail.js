const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Smart Invoice Generator" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

module.exports = sendEmail;