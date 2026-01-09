#!/bin/bash
# =====================================================
# Deployment Script for EC2
# =====================================================
# Usage: ./deploy.sh [production|staging]
# =====================================================

set -e

ENVIRONMENT=${1:-production}
DEPLOY_DIR="/opt/mern-deploy"

if [ "$ENVIRONMENT" = "staging" ]; then
    DEPLOY_DIR="/opt/mern-deploy-staging"
fi

echo "🚀 Deploying to $ENVIRONMENT..."

# Navigate to deployment directory
cd $DEPLOY_DIR

# Pull latest images
echo "📦 Pulling latest Docker images..."
docker-compose -f docker-compose.prod.yml pull

# Stop existing containers gracefully
echo "⏹️ Stopping existing containers..."
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Start new containers
echo "▶️ Starting new containers..."
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 30

# Health check
echo "🔍 Running health check..."
if curl -sf http://localhost/api/health > /dev/null; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed!"
    docker-compose -f docker-compose.prod.yml logs
    exit 1
fi

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo ""
echo "╔════════════════════════════════════════════════╗"
echo "║        Deployment Complete! 🎉                 ║"
echo "╠════════════════════════════════════════════════╣"
echo "║ Environment: $ENVIRONMENT"
echo "║ Status: Running"
echo "╚════════════════════════════════════════════════╝"
