const AWS = require('aws-sdk');
require('dotenv').config();

// Configure AWS
AWS.config.update({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Initialize S3
const s3 = new AWS.S3({
    region: process.env.S3_BUCKET_REGION,
    apiVersion: '2006-03-01'
});

// S3 bucket configuration
const bucketName = process.env.S3_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;

// S3 utility functions
const uploadToS3 = async (fileBuffer, fileName, contentType) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: contentType,
        ACL: 'private', // Private access
        ServerSideEncryption: 'AES256' // Enable encryption
    };

    try {
        const result = await s3.upload(params).promise();
        return {
            success: true,
            location: result.Location,
            key: result.Key,
            bucket: result.Bucket
        };
    } catch (error) {
        console.error('Error uploading to S3:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const deleteFromS3 = async (fileName) => {
    const params = {
        Bucket: bucketName,
        Key: fileName
    };

    try {
        await s3.deleteObject(params).promise();
        return { success: true };
    } catch (error) {
        console.error('Error deleting from S3:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

const getSignedUrl = async (fileName, operation = 'getObject', expiresIn = 3600) => {
    const params = {
        Bucket: bucketName,
        Key: fileName,
        Expires: expiresIn
    };

    try {
        const url = await s3.getSignedUrlPromise(operation, params);
        return { success: true, url };
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Test S3 connection
const testS3Connection = async () => {
    try {
        await s3.headBucket({ Bucket: bucketName }).promise();
        console.log('✅ S3 connection established successfully.');
        console.log(`📦 Using bucket: ${bucketName} in region: ${bucketRegion}`);
    } catch (error) {
        console.error('❌ S3 connection failed:', error.message);
    }
};

module.exports = {
    s3,
    bucketName,
    bucketRegion,
    uploadToS3,
    deleteFromS3,
    getSignedUrl,
    testS3Connection
};
