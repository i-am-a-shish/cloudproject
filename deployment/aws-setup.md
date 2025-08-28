# 🚀 SecureVault AWS Deployment Guide

This guide will walk you through deploying your SecureVault application on AWS with EC2, RDS, and S3.

## 📋 Prerequisites

- AWS Account with appropriate permissions
- Basic knowledge of AWS services
- SSH client (PuTTY for Windows, Terminal for Mac/Linux)
- Domain name (optional but recommended)

## 🏗️ Architecture Overview

```
Internet → Route 53 → Application Load Balancer → EC2 Instance → RDS MySQL → S3 Bucket
```

## 📦 Phase 1: S3 Bucket Setup

### 1.1 Create S3 Bucket
1. Go to AWS S3 Console
2. Click "Create bucket"
3. **Bucket name**: `your-securevault-bucket-2024` (must be globally unique)
4. **Region**: Choose your preferred region (e.g., `us-east-1`)
5. **Block Public Access**: ✅ Keep all settings checked (private bucket)
6. Click "Create bucket"

### 1.2 Configure S3 Bucket
1. Select your bucket
2. Go to "Permissions" tab
3. **Bucket Policy**: Add the following policy for EC2 access:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowEC2Access",
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::YOUR-ACCOUNT-ID:role/EC2S3AccessRole"
            },
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-securevault-bucket-2024",
                "arn:aws:s3:::your-securevault-bucket-2024/*"
            ]
        }
    ]
}
```

4. **CORS Configuration**: Add this CORS policy:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

## 🗄️ Phase 2: RDS Database Setup

### 2.1 Create RDS Instance
1. Go to AWS RDS Console
2. Click "Create database"
3. **Choose a database creation method**: Standard create
4. **Engine type**: MySQL
5. **Version**: MySQL 8.0.28 (or latest)
6. **Templates**: Free tier (for development) or Production
7. **DB instance identifier**: `securevault-db`
8. **Master username**: `admin`
9. **Master password**: Generate a strong password (save it!)
10. **Instance configuration**: 
    - **Instance class**: `db.t3.micro` (free tier) or `db.t3.small`
    - **Storage type**: General Purpose SSD (gp2)
    - **Allocated storage**: 20 GB
11. **Connectivity**: 
    - **VPC**: Default VPC
    - **Public access**: Yes (for development)
    - **VPC security group**: Create new security group
    - **Database port**: 3306
12. **Database authentication**: Password authentication
13. Click "Create database"

### 2.2 Configure Security Group
1. Go to EC2 → Security Groups
2. Find the security group created for RDS
3. **Inbound rules**: Add rule for MySQL (port 3306) from your IP or 0.0.0.0/0 (for development)

### 2.3 Get RDS Endpoint
1. Wait for RDS to be "Available"
2. Copy the endpoint URL (e.g., `securevault-db.abc123.us-east-1.rds.amazonaws.com`)

## 🖥️ Phase 3: EC2 Instance Setup

### 3.1 Create EC2 Instance
1. Go to AWS EC2 Console
2. Click "Launch Instance"
3. **Name**: `SecureVault-Server`
4. **AMI**: Amazon Linux 2023 (free tier eligible)
5. **Instance type**: `t2.micro` (free tier) or `t3.small`
6. **Key pair**: Create new key pair (save the .pem file!)
7. **Network settings**: 
    - **VPC**: Default VPC
    - **Subnet**: Default subnet
    - **Security group**: Create new security group
8. **Security group rules**:
    - SSH (22): Your IP
    - HTTP (80): 0.0.0.0/0
    - HTTPS (443): 0.0.0.0/0
    - Custom TCP (3001): 0.0.0.0/0 (for Node.js app)
9. **Storage**: 8 GB gp2 (free tier)
10. Click "Launch Instance"

### 3.2 Configure EC2 Security Group
1. Go to EC2 → Security Groups
2. Find the security group created for EC2
3. **Inbound rules**: Ensure all required ports are open

### 3.3 Create IAM Role for S3 Access
1. Go to IAM Console
2. **Roles** → **Create role**
3. **Trusted entity**: EC2
4. **Permissions**: Attach `AmazonS3FullAccess` policy
5. **Role name**: `EC2S3AccessRole`
6. **Description**: Role for EC2 to access S3
7. Click "Create role"

### 3.4 Attach IAM Role to EC2
1. Go to EC2 Console
2. Select your instance
3. **Actions** → **Security** → **Modify IAM role**
4. Select `EC2S3AccessRole`
5. Click "Update IAM role"

## 🔧 Phase 4: EC2 Server Setup

### 4.1 Connect to EC2
```bash
# For Windows (PowerShell)
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip

# For Mac/Linux
chmod 400 your-key.pem
ssh -i "your-key.pem" ec2-user@your-ec2-public-ip
```

### 4.2 Update System
```bash
sudo yum update -y
sudo yum install -y git nodejs npm
```

### 4.3 Install Node.js 18+
```bash
# Install Node.js 18
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Verify installation
node --version
npm --version
```

### 4.4 Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

### 4.5 Clone and Setup Application
```bash
# Clone your repository
git clone https://github.com/yourusername/student-portal.git
cd student-portal/backend

# Install dependencies
npm install

# Create environment file
cp env.example .env
nano .env
```

### 4.6 Configure Environment Variables
Edit `.env` file with your AWS configuration:

```env
# Server Configuration
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://your-domain.com

# Database Configuration (RDS)
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=securevault_db
DB_USER=admin
DB_PASSWORD=your-rds-password

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3 Configuration
S3_BUCKET_NAME=your-securevault-bucket-2024
S3_BUCKET_REGION=us-east-1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
```

### 4.7 Create Database
```bash
# Connect to MySQL
mysql -h your-rds-endpoint -u admin -p

# Create database
CREATE DATABASE securevault_db;
USE securevault_db;
EXIT;
```

### 4.8 Start Application
```bash
# Start with PM2
pm2 start server.js --name "securevault"

# Save PM2 configuration
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs securevault
```

## 🌐 Phase 5: Frontend Deployment

### 5.1 Update Frontend Configuration
1. Edit `cloudsimple/script-aws.js`
2. Update `API_BASE_URL` to point to your EC2 instance:

```javascript
const API_BASE_URL = 'http://your-ec2-public-ip:3001/api';
```

### 5.2 Deploy Frontend
Option 1: Direct deployment to EC2
```bash
# On EC2, install nginx
sudo yum install -y nginx

# Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Copy frontend files
sudo cp -r /path/to/cloudsimple/* /usr/share/nginx/html/

# Configure nginx
sudo nano /etc/nginx/conf.d/default.conf
```

Option 2: Deploy to S3 (Static Website Hosting)
1. Go to S3 bucket
2. **Properties** → **Static website hosting**
3. **Enable**: Yes
4. **Index document**: `index.html`
5. **Error document**: `index.html`
6. Upload all frontend files to bucket

## 🔒 Phase 6: Security & SSL

### 6.1 Install Certbot (Let's Encrypt)
```bash
# Install certbot
sudo yum install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 6.2 Configure Nginx
```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🧪 Phase 7: Testing

### 7.1 Test Backend API
```bash
# Test health endpoint
curl http://your-ec2-ip:3001/health

# Test from browser
http://your-ec2-ip:3001/health
```

### 7.2 Test Frontend
1. Open your domain or EC2 public IP
2. Test registration and login
3. Test file upload to S3
4. Test file download

## 📊 Phase 8: Monitoring & Maintenance

### 8.1 Set up CloudWatch
1. Go to CloudWatch Console
2. **Logs** → **Log groups**
3. Create log group for your application

### 8.2 Monitor Performance
```bash
# Check PM2 status
pm2 status
pm2 monit

# Check system resources
htop
df -h
free -h
```

### 8.3 Backup Strategy
1. **RDS**: Enable automated backups
2. **S3**: Enable versioning
3. **EC2**: Create AMI snapshots

## 🚨 Troubleshooting

### Common Issues:
1. **Database Connection Failed**: Check security groups and RDS endpoint
2. **S3 Upload Failed**: Verify IAM role and bucket permissions
3. **Port 3001 Not Accessible**: Check EC2 security group
4. **SSL Certificate Issues**: Verify domain DNS settings

### Useful Commands:
```bash
# Check application logs
pm2 logs securevault

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check system logs
sudo journalctl -u nginx

# Restart services
sudo systemctl restart nginx
pm2 restart securevault
```

## 🎯 Next Steps

1. **Domain Setup**: Configure DNS to point to your EC2 instance
2. **CDN**: Set up CloudFront for better performance
3. **Load Balancer**: Add Application Load Balancer for high availability
4. **Auto Scaling**: Configure auto-scaling groups
5. **Monitoring**: Set up CloudWatch alarms and notifications

## 📞 Support

If you encounter issues:
1. Check AWS CloudTrail for API errors
2. Review EC2 system logs
3. Check RDS performance insights
4. Verify security group configurations

---

**🎉 Congratulations!** Your SecureVault application is now running on AWS with proper backend infrastructure, S3 storage, and database management.
