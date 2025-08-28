const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findByPk(decoded.userId);
        if (!user || !user.isActive) {
            return res.status(401).json({ 
                error: 'Invalid token. User not found or inactive.' 
            });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'Token expired. Please login again.' 
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                error: 'Invalid token.' 
            });
        }
        
        console.error('Auth middleware error:', error);
        return res.status(500).json({ 
            error: 'Internal server error during authentication.' 
        });
    }
};

// Middleware to check if user owns the resource
const authorizeResource = (resourceModel) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id || req.params.documentId;
            if (!resourceId) {
                return res.status(400).json({ 
                    error: 'Resource ID is required.' 
                });
            }

            const resource = await resourceModel.findByPk(resourceId);
            if (!resource) {
                return res.status(404).json({ 
                    error: 'Resource not found.' 
                });
            }

            // Check if user owns the resource
            if (resource.userId !== req.user.id) {
                return res.status(403).json({ 
                    error: 'Access denied. You can only access your own resources.' 
                });
            }

            req.resource = resource;
            next();
        } catch (error) {
            console.error('Authorization error:', error);
            return res.status(500).json({ 
                error: 'Internal server error during authorization.' 
            });
        }
    };
};

// Middleware to check if user is admin (optional)
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({ 
            error: 'Access denied. Admin privileges required.' 
        });
    }
};

module.exports = {
    authenticateToken,
    authorizeResource,
    requireAdmin
};
