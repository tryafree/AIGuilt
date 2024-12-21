#!/bin/bash

# Deployment Script for AiGuilt Platform

# Exit on any error
set -e

# Variables
PROJECT_DIR="/path/to/your/project"
REMOTE_USER="your_hostinger_username"
REMOTE_HOST="your_hostinger_domain.com"
REMOTE_PATH="/home/username/public_html/aiguilt"

# Step 1: Local Preparation
echo "Preparing local project..."
cd $PROJECT_DIR

# Clean and prepare
npm prune --production
npm run lint
npm run test

# Step 2: Create deployment package
echo "Creating deployment package..."
tar -czvf aiguilt-deployment.tar.gz \
    --exclude='*.git*' \
    --exclude='*.env*' \
    --exclude='node_modules' \
    --exclude='*.log' \
    .

# Step 3: Upload to Hostinger
echo "Uploading to Hostinger..."
scp aiguilt-deployment.tar.gz $REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/

# Step 4: Remote Deployment Commands
ssh $REMOTE_USER@$REMOTE_HOST << DEPLOY_COMMANDS
    cd $REMOTE_PATH
    
    # Backup existing deployment
    mkdir -p backups
    tar -czvf backups/backup-$(date +"%Y%m%d_%H%M%S").tar.gz .
    
    # Clean and extract new deployment
    rm -rf node_modules
    tar -xzvf aiguilt-deployment.tar.gz
    
    # Install dependencies
    npm install --production
    
    # Restart application with PM2
    pm2 restart aiguilt-app || pm2 start server.js --name aiguilt-app
    
    # Clean up deployment package
    rm aiguilt-deployment.tar.gz
DEPLOY_COMMANDS

# Step 5: Cleanup local deployment package
rm aiguilt-deployment.tar.gz

echo "Deployment completed successfully!"