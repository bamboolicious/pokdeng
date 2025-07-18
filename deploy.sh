#!/bin/bash

# Cloud Run deployment script for Pok Deng Bot
# Make sure you have gcloud CLI installed and authenticated

# Configuration
PROJECT_ID="your-gcp-project-id"
SERVICE_NAME="pokdeng-bot"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "🚀 Deploying Pok Deng Bot to Google Cloud Run"

# Build and push Docker image
echo "📦 Building Docker image..."
docker build -t ${IMAGE_NAME} .

echo "📤 Pushing image to Google Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo "🌐 Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 3000 \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 10 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production

echo "✅ Deployment complete!"
echo "🔗 Your service URL will be displayed above"
