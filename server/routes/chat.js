const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendMessage } = require('../controllers/chatController');

// Optional auth middleware - doesn't block if no token, just attaches user if available
const optionalAuth = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            // Token invalid - continue as guest
            req.user = null;
        }
    }

    next();
};

// POST /api/chat - Send message to AI assistant (works for both guests and logged-in users)
router.post('/', optionalAuth, sendMessage);

module.exports = router;
