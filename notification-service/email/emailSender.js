const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load .env file explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

console.log('Using SMTP credentials:', process.env.GMAIL_USER, process.env.GMAIL_PASS);

const sendEmail = async (to, subject, text) => {
    try {
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to,
            subject,
            text,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.response}`);
    } catch (err) {
        console.error('Error sending email:', err.message);
    }
};

module.exports = sendEmail;
