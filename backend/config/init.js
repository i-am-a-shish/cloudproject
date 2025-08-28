const { sequelize, testConnection, syncDatabase } = require('./database');
const User = require('../models/User');
const Document = require('../models/Document');

// Define associations
const setupAssociations = () => {
    // User has many Documents
    User.hasMany(Document, {
        foreignKey: 'userId',
        as: 'documents',
        onDelete: 'CASCADE'
    });

    // Document belongs to User
    Document.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    });

    console.log('✅ Database associations set up successfully');
};

// Initialize database
const initializeDatabase = async () => {
    try {
        // Test connection
        await testConnection();
        
        // Set up associations
        setupAssociations();
        
        // Sync database (create tables)
        await syncDatabase();
        
        console.log('✅ Database initialization completed successfully');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
};

// Export for use in server.js
module.exports = {
    initializeDatabase
};
