#!/bin/bash

# Deploy Frontend to AWS S3 + CloudFront

set -e

echo "📦 Building Frontend..."
npm run build

echo "☁️  Deploying to S3..."
AWS_REGION=${AWS_REGION:-us-east-1}
S3_BUCKET=${S3_BUCKET:-mobimea-frontend-prod}

# Sync all files except index.html with cache headers
aws s3 sync dist/ s3://$S3_BUCKET \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "index.html" \
  --region $AWS_REGION

# Upload index.html with no-cache header
aws s3 cp dist/index.html s3://$S3_BUCKET/index.html \
  --cache-control "no-cache,no-store,must-revalidate" \
  --region $AWS_REGION

echo "🌐 Invalidating CloudFront cache..."
if [ -n "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"
else
  echo "⚠️  CLOUDFRONT_DISTRIBUTION_ID not set, skipping invalidation"
fi

echo "✅ Frontend deployed successfully!"
echo "🌐 S3 Bucket: s3://$S3_BUCKET"
