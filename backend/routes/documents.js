const express = require('express');
const multer = require('multer');
const { authenticateToken, authorizeResource } = require('../middleware/auth');
const Document = require('../models/Document');
const { uploadToS3, deleteFromS3, getSignedUrl } = require('../config/aws');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 1
    },
    fileFilter: (req, file, cb) => {
        // Allow common document and image types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('File type not allowed'), false);
        }
    }
});

// Upload document
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded'
            });
        }

        const { title, category, description, tags } = req.body;
        const file = req.file;

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${req.user.id}/${timestamp}-${Math.random().toString(36).substring(7)}.${fileExtension}`;

        // Upload to S3
        const uploadResult = await uploadToS3(
            file.buffer,
            fileName,
            file.mimetype
        );

        if (!uploadResult.success) {
            return res.status(500).json({
                error: 'Failed to upload file to S3',
                details: uploadResult.error
            });
        }

        // Create document record
        const document = await Document.create({
            title: title || file.originalname,
            fileName: fileName,
            originalName: file.originalname,
            fileSize: file.size,
            fileType: file.originalname.split('.').pop(),
            mimeType: file.mimetype,
            category: category || 'personal',
            s3Key: fileName,
            s3Bucket: process.env.S3_BUCKET_NAME,
            s3Region: process.env.S3_BUCKET_REGION,
            description: description || '',
            tags: tags ? JSON.parse(tags) : [],
            userId: req.user.id
        });

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: document.toJSON()
        });

    } catch (error) {
        console.error('Upload error:', error);
        
        if (error.message === 'File type not allowed') {
            return res.status(400).json({
                error: 'File type not allowed. Please upload a valid document or image.'
            });
        }

        res.status(500).json({
            error: 'Internal server error during upload'
        });
    }
});

// Get all documents for current user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search } = req.query;
        const offset = (page - 1) * limit;

        // Build where clause
        const whereClause = { userId: req.user.id };
        if (category && category !== 'all') {
            whereClause.category = category;
        }

        // Build search condition
        let searchCondition = {};
        if (search) {
            searchCondition = {
                [Document.sequelize.Sequelize.Op.or]: [
                    { title: { [Document.sequelize.Sequelize.Op.like]: `%${search}%` } },
                    { originalName: { [Document.sequelize.Sequelize.Op.like]: `%${search}%` } },
                    { description: { [Document.sequelize.Sequelize.Op.like]: `%${search}%` } }
                ]
            };
        }

        // Get documents with pagination
        const { count, rows: documents } = await Document.findAndCountAll({
            where: { ...whereClause, ...searchCondition },
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        // Get statistics
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

        res.json({
            documents: documents.map(doc => doc.toJSON()),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(count / limit),
                totalItems: count,
                itemsPerPage: parseInt(limit)
            },
            statistics: {
                totalDocs,
                pdfCount,
                recentCount
            }
        });

    } catch (error) {
        console.error('Get documents error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching documents'
        });
    }
});

// Get single document
router.get('/:id', authenticateToken, authorizeResource(Document), async (req, res) => {
    try {
        res.json({
            document: req.resource.toJSON()
        });
    } catch (error) {
        console.error('Get document error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching document'
        });
    }
});

// Update document
router.put('/:id', authenticateToken, authorizeResource(Document), async (req, res) => {
    try {
        const { title, category, description, tags } = req.body;
        const updates = {};

        if (title) updates.title = title;
        if (category) updates.category = category;
        if (description !== undefined) updates.description = description;
        if (tags) updates.tags = JSON.parse(tags);

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({
                error: 'No valid fields to update'
            });
        }

        await req.resource.update(updates);

        res.json({
            message: 'Document updated successfully',
            document: req.resource.toJSON()
        });

    } catch (error) {
        console.error('Update document error:', error);
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                error: 'Validation error',
                details: error.errors.map(e => e.message)
            });
        }

        res.status(500).json({
            error: 'Internal server error while updating document'
        });
    }
});

// Delete document
router.delete('/:id', authenticateToken, authorizeResource(Document), async (req, res) => {
    try {
        // Delete from S3
        const deleteResult = await deleteFromS3(req.resource.s3Key);
        if (!deleteResult.success) {
            console.error('Failed to delete from S3:', deleteResult.error);
            // Continue with database deletion even if S3 deletion fails
        }

        // Delete from database
        await req.resource.destroy();

        res.json({
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({
            error: 'Internal server error while deleting document'
        });
    }
});

// Download document
router.get('/:id/download', authenticateToken, authorizeResource(Document), async (req, res) => {
    try {
        // Generate signed URL for download
        const signedUrlResult = await getSignedUrl(
            req.resource.s3Key,
            'getObject',
            3600 // 1 hour expiry
        );

        if (!signedUrlResult.success) {
            return res.status(500).json({
                error: 'Failed to generate download link',
                details: signedUrlResult.error
            });
        }

        res.json({
            downloadUrl: signedUrlResult.url,
            fileName: req.resource.originalName,
            expiresIn: '1 hour'
        });

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({
            error: 'Internal server error while generating download link'
        });
    }
});

// Get document categories
router.get('/categories/list', authenticateToken, async (req, res) => {
    try {
        const categories = await Document.findAll({
            attributes: [
                'category',
                [Document.sequelize.Sequelize.fn('COUNT', Document.sequelize.Sequelize.col('id')), 'count']
            ],
            where: { userId: req.user.id },
            group: ['category'],
            order: [['count', 'DESC']]
        });

        res.json({
            categories: categories.map(cat => ({
                category: cat.category,
                count: parseInt(cat.dataValues.count)
            }))
        });

    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            error: 'Internal server error while fetching categories'
        });
    }
});

module.exports = router;
