#!/bin/bash

# 🚀 SecureVault AWS Deployment Script
# This script automates the deployment of your SecureVault application on EC2

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration variables
APP_NAME="securevault"
APP_PORT=3001
NODE_VERSION="18"

echo -e "${BLUE}🚀 Starting SecureVault deployment...${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo yum update -y

# Install essential packages
print_status "Installing essential packages..."
sudo yum install -y git curl wget unzip

# Install Node.js
print_status "Installing Node.js $NODE_VERSION..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://rpm.nodesource.com/setup_$NODE_VERSION.x | sudo bash -
    sudo yum install -y nodejs
else
    print_warning "Node.js is already installed"
fi

# Verify Node.js installation
NODE_VERSION_INSTALLED=$(node --version)
NPM_VERSION_INSTALLED=$(npm --version)
print_status "Node.js $NODE_VERSION_INSTALLED installed"
print_status "npm $NPM_VERSION_INSTALLED installed"

# Install PM2 globally
print_status "Installing PM2 process manager..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    print_warning "PM2 is already installed"
fi

# Install nginx
print_status "Installing nginx..."
if ! command -v nginx &> /dev/null; then
    sudo yum install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
else
    print_warning "nginx is already installed"
fi

# Create application directory
APP_DIR="/home/ec2-user/$APP_NAME"
print_status "Setting up application directory: $APP_DIR"
mkdir -p $APP_DIR
cd $APP_DIR

# Clone repository (if not exists)
if [ ! -d "backend" ]; then
    print_status "Cloning repository..."
    git clone https://github.com/yourusername/student-portal.git .
else
    print_status "Repository already exists, pulling latest changes..."
    git pull origin main
fi

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install --production

# Create environment file if it doesn't exist
if [ ! -f ".env" ]; then
    print_warning "Creating .env file from template..."
    cp env.example .env
    print_warning "Please edit .env file with your AWS configuration before starting the application"
    print_warning "Use: nano .env"
else
    print_status ".env file already exists"
fi

# Create nginx configuration
print_status "Configuring nginx..."
sudo tee /etc/nginx/conf.d/$APP_NAME.conf > /dev/null <<EOF
server {
    listen 80;
    server_name _;
    
    # Frontend files
    location / {
        root /home/ec2-user/$APP_NAME/cloudsimple;
        try_files \$uri \$uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://localhost:$APP_PORT/health;
        proxy_set_header Host \$host;
    }
}
EOF

# Test nginx configuration
print_status "Testing nginx configuration..."
sudo nginx -t

# Reload nginx
print_status "Reloading nginx..."
sudo systemctl reload nginx

# Start application with PM2
print_status "Starting application with PM2..."
cd $APP_DIR/backend

# Check if app is already running
if pm2 list | grep -q "$APP_NAME"; then
    print_warning "Application is already running, restarting..."
    pm2 restart $APP_NAME
else
    print_status "Starting new application instance..."
    pm2 start server.js --name $APP_NAME
fi

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script
print_status "Setting up PM2 startup script..."
pm2 startup

# Display PM2 status
print_status "PM2 Status:"
pm2 status

# Display application logs
print_status "Application logs (last 20 lines):"
pm2 logs $APP_NAME --lines 20

# Test application
print_status "Testing application..."
sleep 5  # Wait for app to start

if curl -s http://localhost:$APP_PORT/health > /dev/null; then
    print_status "Application is running successfully!"
    print_status "Backend API: http://localhost:$APP_PORT"
    print_status "Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
else
    print_error "Application failed to start. Check logs with: pm2 logs $APP_NAME"
    exit 1
fi

# Display useful commands
echo ""
echo -e "${BLUE}📋 Useful Commands:${NC}"
echo -e "${GREEN}Check app status:${NC} pm2 status"
echo -e "${GREEN}View logs:${NC} pm2 logs $APP_NAME"
echo -e "${GREEN}Restart app:${NC} pm2 restart $APP_NAME"
echo -e "${GREEN}Stop app:${NC} pm2 stop $APP_NAME"
echo -e "${GREEN}Check nginx status:${NC} sudo systemctl status nginx"
echo -e "${GREEN}Check nginx logs:${NC} sudo tail -f /var/log/nginx/error.log"
echo ""

print_status "🎉 Deployment completed successfully!"
print_warning "Don't forget to:"
print_warning "1. Configure your .env file with AWS credentials"
print_warning "2. Set up your domain DNS (if applicable)"
print_warning "3. Configure SSL certificate with Let's Encrypt"
print_warning "4. Set up monitoring and backups"

