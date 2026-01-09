#!/bin/bash
# =====================================================
# AWS EC2 Setup Script for MERN Deployment
# =====================================================
# Run this script on a fresh EC2 instance (Amazon Linux 2023 or Ubuntu)
# Usage: bash aws-setup.sh
# =====================================================

set -e

echo "╔════════════════════════════════════════════════╗"
echo "║   MERN Cloud Deployment - EC2 Setup Script     ║"
echo "╚════════════════════════════════════════════════╝"

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ Unable to detect OS"
    exit 1
fi

echo "📋 Detected OS: $OS"

# ====================
# Install Docker
# ====================
echo "🐳 Installing Docker..."

if [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ]; then
    # Amazon Linux / RHEL
    sudo yum update -y
    sudo yum install -y docker
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ec2-user
    
elif [ "$OS" = "ubuntu" ]; then
    # Ubuntu
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    
    # Add Docker GPG key
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    # Add repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | \
        sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker ubuntu
fi

echo "✅ Docker installed successfully"

# ====================
# Install Docker Compose
# ====================
echo "🐳 Installing Docker Compose..."

COMPOSE_VERSION=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep 'tag_name' | cut -d\" -f4)
sudo curl -L "https://github.com/docker/compose/releases/download/${COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "✅ Docker Compose installed: $(docker-compose --version)"

# ====================
# Create Deployment Directory
# ====================
echo "📁 Setting up deployment directory..."

sudo mkdir -p /opt/mern-deploy
sudo chown $(whoami):$(whoami) /opt/mern-deploy

# Create staging directory
sudo mkdir -p /opt/mern-deploy-staging
sudo chown $(whoami):$(whoami) /opt/mern-deploy-staging

echo "✅ Deployment directories created"

# ====================
# Configure Firewall
# ====================
echo "🔒 Configuring firewall rules..."

if [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ]; then
    sudo yum install -y firewalld
    sudo systemctl start firewalld
    sudo systemctl enable firewalld
    sudo firewall-cmd --permanent --add-port=80/tcp
    sudo firewall-cmd --permanent --add-port=443/tcp
    sudo firewall-cmd --reload
elif [ "$OS" = "ubuntu" ]; then
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw allow 22/tcp
    sudo ufw --force enable
fi

echo "✅ Firewall configured (ports 80, 443, 22)"

# ====================
# Install Certbot (SSL)
# ====================
echo "🔐 Installing Certbot for SSL certificates..."

if [ "$OS" = "amzn" ] || [ "$OS" = "rhel" ]; then
    sudo yum install -y certbot
elif [ "$OS" = "ubuntu" ]; then
    sudo apt-get install -y certbot
fi

echo "✅ Certbot installed"

# ====================
# Create Nginx Config Directory
# ====================
mkdir -p /opt/mern-deploy/deploy/ssl

# ====================
# Summary
# ====================
echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║              Setup Complete! 🎉                ║"
echo "╠════════════════════════════════════════════════╣"
echo "║ Next Steps:                                    ║"
echo "║                                                ║"
echo "║ 1. Copy your docker-compose.prod.yml to:      ║"
echo "║    /opt/mern-deploy/                          ║"
echo "║                                                ║"
echo "║ 2. Copy your Nginx config to:                 ║"
echo "║    /opt/mern-deploy/deploy/nginx.conf         ║"
echo "║                                                ║"
echo "║ 3. Create .env file with secrets:             ║"
echo "║    /opt/mern-deploy/.env                      ║"
echo "║                                                ║"
echo "║ 4. Set up SSL certificate:                    ║"
echo "║    sudo certbot certonly --standalone \\       ║"
echo "║      -d yourdomain.com                        ║"
echo "║                                                ║"
echo "║ 5. Log out and back in for Docker access      ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "📌 Remember to configure your Security Group to allow:"
echo "   - Port 22 (SSH)"
echo "   - Port 80 (HTTP)"
echo "   - Port 443 (HTTPS)"
