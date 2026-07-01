const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            phone
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user with phone
// @route   POST /api/auth/phone-login
// @access  Public
const loginWithPhone = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ message: 'Phone number is required' });
        }

        let user = await User.findOne({ phone: '+91' + phone });

        if (!user) {
            user = await User.create({
                name: 'User',
                phone: '+91' + phone,
                email: `${phone}@phone.user`,
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
                role: user.role,
                wishlist: user.wishlist
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;

            if (req.body.address) {
                user.address = { ...user.address, ...req.body.address };
            }

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                role: updatedUser.role,
                token: generateToken(updatedUser._id)
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// In-memory OTP storage
const otpStorage = {};

// @desc    Send OTP via Email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with expiry (5 minutes)
        otpStorage[email] = {
            otp,
            expiresAt: Date.now() + 5 * 60 * 1000
        };

        // Send OTP via Email
        const mailOptions = {
            from: `"Westside Store" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Your Login OTP - Westside',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
                    <h2 style="text-align: center; color: #333;">🔐 Login OTP</h2>
                    <p style="color: #666; text-align: center;">Your one-time password for Westside login:</p>
                    <div style="background: #000; color: #fff; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px; text-align: center;">This OTP expires in 5 minutes. Do not share it with anyone.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 OTP sent to ${email}`);

        res.json({
            success: true,
            message: 'OTP sent to your email!'
        });
    } catch (error) {
        console.error('Email OTP error:', error.message);
        res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
};

// @desc    Verify OTP and Login
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        const storedOTP = otpStorage[email];

        if (!storedOTP) {
            return res.status(400).json({ message: 'OTP expired or not found. Please request a new OTP.' });
        }

        if (Date.now() > storedOTP.expiresAt) {
            delete otpStorage[email];
            return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
        }

        if (storedOTP.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        // OTP verified - delete from storage
        delete otpStorage[email];

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                name: email.split('@')[0],
                email: email,
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8)
            });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Please enter your email address' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No account found with this email address' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Store OTP with expiry (10 minutes for password reset)
        otpStorage[`reset_${email}`] = {
            otp,
            expiresAt: Date.now() + 10 * 60 * 1000
        };

        console.log(`🔑 Password reset OTP for ${email}: ${otp}`);

        // Try to send OTP via Email
        let emailSent = false;
        try {
            const mailOptions = {
                from: `"Westside Store" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Password Reset OTP - Westside',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 30px; background: #f9f9f9; border-radius: 10px;">
                        <h2 style="text-align: center; color: #333;">🔑 Password Reset</h2>
                        <p style="color: #666; text-align: center;">Use this OTP to reset your Westside account password:</p>
                        <div style="background: #000; color: #fff; font-size: 32px; letter-spacing: 8px; text-align: center; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            ${otp}
                        </div>
                        <p style="color: #999; font-size: 12px; text-align: center;">This OTP expires in 10 minutes. Do not share it with anyone.</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            emailSent = true;
        } catch (emailError) {
            console.log('⚠️ Email not configured, OTP shown in response (dev mode)');
        }

        const response = {
            success: true,
            message: emailSent
                ? 'Password reset OTP sent to your email!'
                : 'OTP generated! Check the server terminal for OTP (email not configured).'
        };

        // In development mode, include OTP in response if email failed
        if (!emailSent && process.env.NODE_ENV === 'development') {
            response.devOtp = otp;
        }

        res.json(response);
    } catch (error) {
        console.error('Forgot password error:', error.message);
        res.status(500).json({ message: 'Failed to process request. Please try again.' });
    }
};


// @desc    Reset Password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ message: 'Email, OTP, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        const storedOTP = otpStorage[`reset_${email}`];

        if (!storedOTP) {
            return res.status(400).json({ message: 'OTP expired or not found. Please request a new OTP.' });
        }

        if (Date.now() > storedOTP.expiresAt) {
            delete otpStorage[`reset_${email}`];
            return res.status(400).json({ message: 'OTP expired. Please request a new OTP.' });
        }

        if (storedOTP.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
        }

        // OTP verified - delete from storage
        delete otpStorage[`reset_${email}`];

        // Update password
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.password = newPassword;
        await user.save(); // pre('save') hook will hash the password

        console.log(`✅ Password reset successful for ${email}`);

        res.json({
            success: true,
            message: 'Password reset successful! You can now login with your new password.'
        });
    } catch (error) {
        console.error('Reset password error:', error.message);
        res.status(500).json({ message: 'Failed to reset password. Please try again.' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    loginWithPhone,
    sendOTP,
    verifyOTP,
    getUserProfile,
    updateUserProfile,
    forgotPassword,
    resetPassword
};
