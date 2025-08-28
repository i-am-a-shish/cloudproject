const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// User Registration
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({
                error: 'All fields are required: name, email, password'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                error: 'User with this email already exists'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email,
            password
        });

        // Generate token
        const token = generateToken(user.id);

        // Update last login
        await user.update({ lastLogin: new Date() });

        res.status(201).json({
            message: 'User registered successfully',
            user: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            error: 'Internal server error during registration'
        });
    }
});

// User Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                error: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Invalid email or password'
            });
        }

        // Generate token
        const token = generateToken(user.id);

        // Update last login
        await user.update({ lastLogin: new Date() });

        res.json({
            message: 'Login successful',
            user: user.toJSON(),
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Internal server error during login'
        });
    }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        res.json({
            user: req.user.toJSON()
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching profile'
        });
    }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email } = req.body;
        const updates = {};

        if (name) updates.name = name;
        if (email) {
            // Check if email is already taken by another user
            const existingUser = await User.findOne({ 
                where: { 
                    email,
                    id: { [User.sequelize.Sequelize.Op.ne]: req.user.id }
                }
            });
            if (existingUser) {
                return res.status(409).json({
                    error: 'Email is already taken by another user'
                });
            }
            updates.email = email;
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'No valid fields to update'
            });
        }

        await req.user.update(updates);

        res.json({
            message: 'Profile updated successfully',
            user: req.user.toJSON()
        });

    } catch (error) {
        console.error('Profile update error:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            error: 'Internal server error while updating profile'
        });
    }
});

// Change password
router.put('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                error: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                error: 'New password must be at least 6 characters long'
            });
        }

        // Verify current password
        const isValidPassword = await req.user.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Current password is incorrect'
            });
        }

        // Update password
        await req.user.update({ password: newPassword });

        res.json({
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            error: 'Internal server error while changing password'
        });
    }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // In a real application, you might want to blacklist the token
        // For now, we'll just return success and let the client remove the token
        
        res.json({
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            error: 'Internal server error during logout'
        });
    }
});

module.exports = router;
