const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// POST route for contact form submissions
router.post('/', async (req, res) => {
    const { name, email, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    try {
        // Log the contact form submission
        console.log('Contact form submission:', { name, email, message });
        
        // For now, just log the submission without sending email
        console.log('Contact form submission:', { name, email, message });
        console.log('Email sending temporarily disabled - Outlook configuration needs testing');
        
        // TODO: Test Outlook SMTP configuration
        /*
        // Create transporter for sending emails using Outlook
        const transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'yamen.rock@gmail.com',
            subject: `New Contact Form Submission from ${name}`,
            text: `
                Name: ${name}
                Email: ${email}
                Message: ${message}
            `,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        */

        res.status(200).json({ message: 'Message sent successfully!' });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Failed to send message. Please try again later.' });
    }
});

module.exports = router; 