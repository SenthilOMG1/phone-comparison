#!/bin/bash

# Deploy Backend to AWS ECS

set -e

echo "🐳 Building and Deploying Backend..."

AWS_REGION=${AWS_REGION:-us-east-1}
ECR_REPOSITORY=${ECR_REPOSITORY:-mobimea-backend}
ECS_CLUSTER=${ECS_CLUSTER:-mobimea-cluster}
ECS_SERVICE=${ECS_SERVICE:-mobimea-backend-service}

# Get AWS account ID
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

echo "📦 Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REGISTRY

echo "🏗️  Building Docker image..."
cd backend
docker build -t $ECR_REPOSITORY:latest .
docker tag $ECR_REPOSITORY:latest $ECR_REGISTRY/$ECR_REPOSITORY:latest

echo "⬆️  Pushing to ECR..."
docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

echo "🚀 Deploying to ECS..."
aws ecs update-service \
  --cluster $ECS_CLUSTER \
  --service $ECS_SERVICE \
  --force-new-deployment \
  --region $AWS_REGION

echo "⏳ Waiting for deployment to stabilize..."
aws ecs wait services-stable \
  --cluster $ECS_CLUSTER \
  --services $ECS_SERVICE \
  --region $AWS_REGION

echo "✅ Backend deployed successfully!"
echo "🐳 Image: $ECR_REGISTRY/$ECR_REPOSITORY:latest"
echo "🚀 Service: $ECS_SERVICE"
