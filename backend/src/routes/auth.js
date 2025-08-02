const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const dbSingleton = require('../../dbSingleton.js');
const { authenticateToken } = require('../middleware/auth.js');
const multer = require('multer');
const path = require('path');

const router = express.Router();
const db = dbSingleton.getConnection();

// --- Multer Configuration for File Uploads ---
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ensure this 'uploads' directory exists in the backend root
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// POST route for uploading an image
router.post('/upload-image', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file.' });
    }
    const imageUrl = `/${req.file.path.replace(/\\/g, '/')}`;
    res.status(200).json({ imageUrl: imageUrl });
});

// ✅ API - הרשמה
router.post('/register', async (req, res) => {
  const { email, password, name, phone, city } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = `INSERT INTO users (email, password, name, phone, city) VALUES (?, ?, ?, ?, ?)`;
  try {
    await db.query(sql, [email, hashedPassword, name, phone, city]);
    res.json({ message: 'User registered successfully' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    console.error('Database error during registration:', err);
    return res.status(500).json({ message: 'Database error', error: err.message });
  }
});

// ✅ API - התחברות
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const sql = `SELECT * FROM users WHERE email = ?`;

  try {
    console.log(`Login attempt for email: ${email}`);
    const [results] = await db.query(sql, [email]);

    if (results.length === 0) {
      console.log(`Login failed: Invalid email or password for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = results[0];
    const passwordMatch = bcrypt.compareSync(password, user.password);

    if (!passwordMatch) {
      console.log(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, username: user.name },
      'secretKey',
      { expiresIn: '1h' },
    );
    console.log(`Login successful for user: ${user.name}`);
    res.json({ message: 'Login successful', token, role: user.role });
  } catch (err) {
    console.error('Login database error:', err);
    return res.status(500).json({ message: 'Database error', details: err.message });
  }
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const user = users[0];

        // Create a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await db.query('UPDATE users SET resetPasswordToken = ?, resetPasswordExpires = ? WHERE user_id = ?', [resetToken, resetPasswordExpires, user.user_id]);

        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('Email credentials not configured. Skipping email send.');
            // For development, we'll return success but log the reset token
            console.log(`Password reset token for ${email}: ${resetToken}`);
            return res.status(200).json({ 
                message: 'Password reset token generated. Check server logs for token (email not configured).',
                token: resetToken // Only for development
            });
        }

        // Send the email
        const transporter = nodemailer.createTransport({
            host: 'smtp-mail.outlook.com',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            to: user.email,
            from: process.env.EMAIL_USER,
            subject: 'TechStock Password Reset',
            text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                   Please click on the following link, or paste this into your browser to complete the process:\n\n
                   http://localhost:3000/reset-password/${resetToken}\n\n
                   If you did not request this, please ignore this email and your password will remain unchanged.\n`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset email sent' });

    } catch (err) {
        console.error('Forgot password error:', err);
        
        // Handle email-specific errors gracefully
        if (err.code === 'EAUTH' || err.message.includes('Authentication unsuccessful') || err.message.includes('basic authentication is disabled')) {
            console.log('Email authentication failed. Outlook requires OAuth2 or App Password.');
            return res.status(200).json({ 
                message: 'Password reset initiated. Email service requires OAuth2 configuration.',
                error: 'Email service unavailable - requires OAuth2 setup'
            });
        }
        
        res.status(500).json({ message: 'Server error', error: err.message });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE resetPasswordToken = ? AND resetPasswordExpires > ?', [token, Date.now()]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
        }

        const user = users[0];
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query('UPDATE users SET password = ?, resetPasswordToken = NULL, resetPasswordExpires = NULL WHERE user_id = ?', [hashedPassword, user.user_id]);

        res.status(200).json({ message: "Password has been reset successfully." });
    } catch (err) {
        console.error('Error during password reset:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router; 