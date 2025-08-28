# 🛡️ SecureVault - Personal Document Manager

A secure, cloud-based document management system built with Node.js, AWS services, and modern web technologies.

## 🌟 Features

- **🔐 Secure Authentication**: JWT-based user authentication with bcrypt password hashing
- **📁 Document Management**: Upload, organize, and manage documents by category
- **☁️ Cloud Storage**: AWS S3 integration for scalable file storage
- **🔍 Smart Search**: Search through documents by title, category, and content
- **📱 Responsive Design**: Modern, mobile-friendly user interface
- **🔄 Real-time Updates**: Live dashboard with document statistics
- **📊 Analytics**: Document insights and usage statistics
- **🔒 Security**: Private S3 buckets with encrypted file storage

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   AWS Services  │
│   (HTML/CSS/JS) │◄──►│   (Node.js)     │◄──►│   (S3, RDS)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: MySQL (AWS RDS)
- **Storage**: AWS S3
- **Authentication**: JWT, bcrypt
- **Server**: AWS EC2 with PM2 process manager
- **Web Server**: Nginx reverse proxy

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MySQL database
- AWS account with S3, RDS, and EC2 access
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/student-portal.git
   cd student-portal
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../cloudsimple
   # Update script-aws.js with your API URL
   # Open index.html in browser
   ```

4. **Database Setup**
   ```bash
   # Create MySQL database
   CREATE DATABASE securevault_db;
   
   # Tables will be created automatically by Sequelize
   ```

## 🐳 AWS Deployment

### Step-by-Step Deployment

1. **Create AWS Infrastructure**
   - S3 bucket for file storage
   - RDS MySQL instance
   - EC2 instance for application hosting

2. **Configure Security**
   - IAM roles for EC2-S3 access
   - Security groups for network access
   - SSL certificates with Let's Encrypt

3. **Deploy Application**
   ```bash
   # On EC2 instance
   chmod +x deployment/deploy.sh
   ./deployment/deploy.sh
   ```

### Detailed Deployment Guide

See [AWS Deployment Guide](deployment/aws-setup.md) for complete step-by-step instructions.

## 📁 Project Structure

```
student-portal/
├── backend/                 # Node.js backend API
│   ├── config/             # Database and AWS configuration
│   ├── middleware/         # Authentication middleware
│   ├── models/             # Database models (User, Document)
│   ├── routes/             # API endpoints
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── cloudsimple/            # Frontend application
│   ├── index.html          # Main HTML file
│   ├── styles.css          # CSS styles
│   ├── script.js           # Original JavaScript
│   └── script-aws.js       # AWS-integrated JavaScript
├── deployment/             # Deployment scripts and guides
│   ├── aws-setup.md        # AWS setup instructions
│   └── deploy.sh           # Automated deployment script
└── README.md               # This file
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

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
DB_PASSWORD=your-secure-password

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# S3 Configuration
S3_BUCKET_NAME=your-securevault-bucket
S3_BUCKET_REGION=us-east-1

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Security
BCRYPT_SALT_ROUNDS=12
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/logout` - User logout

### Document Endpoints

- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/download` - Download document

### User Endpoints

- `GET /api/users/dashboard` - Get dashboard statistics
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/activity` - Get user activity

## 🔒 Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configurable cross-origin resource sharing
- **Rate Limiting**: API request rate limiting
- **Input Validation**: Comprehensive input sanitization
- **Private S3 Access**: Encrypted file storage with private access
- **SQL Injection Protection**: Parameterized queries with Sequelize

## 📱 Frontend Features

- **Responsive Design**: Mobile-first responsive layout
- **Drag & Drop**: Intuitive file upload interface
- **Real-time Search**: Instant document search functionality
- **Category Management**: Organize documents by type
- **File Preview**: Visual file type indicators
- **Progress Notifications**: User-friendly status messages

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check RDS endpoint and credentials
   - Verify security group settings
   - Ensure database is running

2. **S3 Upload Failed**
   - Verify IAM role permissions
   - Check bucket name and region
   - Ensure bucket exists and is accessible

3. **Port Access Issues**
   - Check EC2 security group rules
   - Verify nginx configuration
   - Check firewall settings

### Debug Commands

```bash
# Check application status
pm2 status
pm2 logs securevault

# Check nginx status
sudo systemctl status nginx
sudo nginx -t

# Check system resources
htop
df -h
free -h
```

## 📊 Performance & Scaling

### Current Limitations

- Single EC2 instance (no load balancing)
- Single RDS instance (no read replicas)
- No CDN for static assets
- Limited auto-scaling

### Scaling Recommendations

1. **Application Load Balancer**: Distribute traffic across multiple EC2 instances
2. **Auto Scaling Groups**: Automatically scale EC2 instances based on demand
3. **RDS Read Replicas**: Distribute database read operations
4. **CloudFront CDN**: Cache static assets globally
5. **ElastiCache**: Redis caching for session management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome**: Icons used throughout the application
- **AWS**: Cloud infrastructure and services
- **Node.js Community**: Open-source packages and tools
- **Express.js**: Web application framework

## 📞 Support

If you need help with deployment or encounter issues:

1. Check the [AWS Deployment Guide](deployment/aws-setup.md)
2. Review the troubleshooting section above
3. Check AWS CloudTrail and CloudWatch logs
4. Open an issue on GitHub

---

**🎉 Happy Document Managing!** 

Your SecureVault application is now ready to securely store and manage your important documents in the cloud.

