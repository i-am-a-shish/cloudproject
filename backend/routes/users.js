const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Document = require('../models/Document');

const router = express.Router();

// Get user dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        // Get document statistics
        const totalDocs = await Document.count({ where: { userId: req.user.id } });
        const pdfCount = await Document.count({ 
            where: { 
                userId: req.user.id,
                mimeType: 'application/pdf'
            }
        });

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentCount = await Document.count({
            where: {
                userId: req.user.id,
                createdAt: { [Document.sequelize.Sequelize.Op.gt]: weekAgo }
            }
        });

        // Get category breakdown
        const categories = await Document.findAll({
            attributes: [
                'category',
                [Document.sequelize.Sequelize.fn('COUNT', Document.sequelize.Sequelize.col('id')), 'count']
            ],
            where: { userId: req.user.id },
            group: ['category'],
            order: [['count', 'DESC']]
        });

        // Get recent documents
        const recentDocuments = await Document.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: 5
        });

        res.json({
            statistics: {
                totalDocs,
                pdfCount,
                recentCount
            },
            categories: categories.map(cat => ({
                category: cat.category,
                count: parseInt(cat.dataValues.count)
            })),
            recentDocuments: recentDocuments.map(doc => doc.toJSON())
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching dashboard data'
        });
    }
});

// Get user profile
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

// Delete user account
router.delete('/account', authenticateToken, async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                error: 'Password is required to delete account'
            });
        }

        // Verify password
        const isValidPassword = await req.user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                error: 'Password is incorrect'
            });
        }

        // Delete all user documents from S3 (this would need to be implemented)
        // For now, we'll just delete the user and let the database handle document deletion

        // Delete user (this will cascade delete documents if foreign key constraints are set up)
        await req.user.destroy();

        res.json({
            message: 'Account deleted successfully'
        });

    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            error: 'Internal server error while deleting account'
        });
    }
});

// Get user activity
router.get('/activity', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const offset = (page - 1) * limit;

        // Get user's documents with pagination
        const { count, rows: documents } = await Document.findAndCountAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({
            activity: documents.map(doc => ({
                id: doc.id,
                type: 'document_upload',
                title: doc.title,
                category: doc.category,
                timestamp: doc.createdAt,
                details: `Uploaded ${doc.originalName}`
            })),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            }
        });

    } catch (error) {
        console.error('Activity fetch error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching activity'
        });
    }
});

module.exports = router;
