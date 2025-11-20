#!/bin/bash

# MobiMEA Intelligence Platform - Production Deployment Script

set -e

echo "🚀 MobiMEA Intelligence Platform - Production Deployment"
echo "==========================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file with:"
    echo "   DB_PASSWORD=your_password"
    echo "   GEMINI_API_KEY=your_key"
    exit 1
fi

echo "✅ Environment file found"

# Build production frontend
echo "📦 Building frontend..."
npm run build

# Build Docker images
echo "🐳 Building Docker images..."
docker-compose build

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start services
echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to start..."
sleep 10

# Check health
echo "🏥 Checking health..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Frontend: healthy"
else
    echo "⚠️  Frontend: not responding"
fi

if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend: healthy"
else
    echo "⚠️  Backend: not responding"
fi

echo ""
echo "🎉 Deployment complete!"
echo "📊 Access your application:"
echo "   Frontend: http://localhost"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "📝 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
