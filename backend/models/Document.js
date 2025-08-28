const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Document = sequelize.define('Document', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            len: [1, 255]
        }
    },
    fileName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    originalName: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    fileSize: {
        type: DataTypes.BIGINT,
        allowNull: false,
        validate: {
            min: 1
        }
    },
    fileType: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    mimeType: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    category: {
        type: DataTypes.ENUM('personal', 'work', 'financial', 'legal', 'medical', 'other'),
        defaultValue: 'personal'
    },
    s3Key: {
        type: DataTypes.STRING(500),
        allowNull: false
    },
    s3Bucket: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    s3Region: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    isPublic: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    tags: {
        type: DataTypes.TEXT,
        get() {
            const rawValue = this.getDataValue('tags');
            return rawValue ? JSON.parse(rawValue) : [];
        },
        set(value) {
            this.setDataValue('tags', JSON.stringify(value));
        }
    },
    description: {
        type: DataTypes.TEXT
    }
}, {
    tableName: 'documents',
    timestamps: true,
    indexes: [
        {
            fields: ['userId']
        },
        {
            fields: ['category']
        },
        {
            fields: ['createdAt']
        }
    ]
});

// Instance method to get file extension
Document.prototype.getFileExtension = function() {
    return this.originalName.split('.').pop().toLowerCase();
};

// Instance method to check if file is image
Document.prototype.isImage = function() {
    return this.mimeType.startsWith('image/');
};

// Instance method to check if file is PDF
Document.prototype.isPDF = function() {
    return this.mimeType === 'application/pdf';
};

// Instance method to get formatted file size
Document.prototype.getFormattedSize = function() {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = Document;
