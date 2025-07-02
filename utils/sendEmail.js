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
    if (!to || !subject || !html) {
      throw new Error('Missing required email fields');
    }

    await transporter.sendMail({
      from: `"Smart Invoice Generator" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });

    console.log('Email sent successfully');
  } catch (err) {
    console.error('Error sending email:', err.stack || err);
    throw err;  // re-throw so caller knows it failed
  }
};

module.exports = sendEmail;
