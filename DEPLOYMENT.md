# Deployment Guide - Google Cloud Run

This guide explains how to deploy the Pok Deng Bot to Google Cloud Run.

## Prerequisites

1. **Google Cloud Project**
   - Create a GCP project
   - Enable billing
   - Enable Cloud Run API
   - Enable Container Registry API

2. **Local Setup**
   ```bash
   # Install Google Cloud CLI
   # https://cloud.google.com/sdk/docs/install
   
   # Authenticate
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   
   # Configure Docker for GCR
   gcloud auth configure-docker
   ```

## Deployment Options

### Option 1: Manual Deployment (Quick)

1. **Update Configuration**
   ```bash
   # Edit deploy.sh and set your project ID
   nano deploy.sh
   # Change PROJECT_ID="your-gcp-project-id" to your actual project ID
   ```

2. **Deploy**
   ```bash
   ./deploy.sh
   ```

### Option 2: Cloud Build (Automated)

1. **Setup Cloud Build**
   ```bash
   # Enable Cloud Build API
   gcloud services enable cloudbuild.googleapis.com
   
   # Grant Cloud Run permissions to Cloud Build
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:$(gcloud projects describe YOUR_PROJECT_ID \
     --format="value(projectNumber)")@cloudbuild.gserviceaccount.com" \
     --role="roles/run.developer"
   ```

2. **Deploy via Cloud Build**
   ```bash
   gcloud builds submit --config cloudbuild.yaml
   ```

### Option 3: GitHub Actions (CI/CD)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - uses: google-github-actions/setup-gcloud@v0
      with:
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        project_id: ${{ secrets.GCP_PROJECT_ID }}
    
    - run: gcloud builds submit --config cloudbuild.yaml
```

## Configuration

### Environment Variables
- `NODE_ENV`: Set to "production"
- `PORT`: Cloud Run automatically sets this to the container port

### Resource Limits
- **Memory**: 512Mi (can be adjusted based on needs)
- **CPU**: 1 vCPU
- **Timeout**: 300 seconds
- **Instances**: 0 min, 10 max (auto-scaling)

## API Endpoints

Once deployed, your service will be available at:
```
https://pokdeng-bot-[hash]-uc.a.run.app
```

### Available Endpoints:
- `GET /health` - Health check
- `GET /rules` - Game rules
- `POST /` - Make decisions (main endpoint)
- `POST /all-hit` - All hit decisions
- `POST /all-stand` - All stand decisions
- `POST /all-random` - Random decisions
- `POST /test` - Run performance tests

## Monitoring

### View Logs
```bash
gcloud run services logs read pokdeng-bot --region=us-central1
```

### Monitor Performance
- Go to Cloud Run console
- Select your service
- View metrics and logs

## Costs

Cloud Run pricing (us-central1):
- **CPU**: $0.00002400 per vCPU-second
- **Memory**: $0.00000250 per GiB-second
- **Requests**: $0.40 per million requests
- **Free tier**: 2 million requests, 400,000 GiB-seconds, 200,000 vCPU-seconds per month

For a typical bot with moderate usage, expect $5-20/month.

## Troubleshooting

### Common Issues

1. **Build Fails**
   ```bash
   # Check if APIs are enabled
   gcloud services list --enabled
   
   # Enable required APIs
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

2. **Permission Denied**
   ```bash
   # Check IAM permissions
   gcloud projects get-iam-policy YOUR_PROJECT_ID
   ```

3. **Service Won't Start**
   ```bash
   # Check logs
   gcloud run services logs read pokdeng-bot --region=us-central1 --limit=50
   ```

## Security

- Service is configured to allow unauthenticated requests
- Consider adding authentication for production use
- Monitor usage and set up billing alerts

## Updates

To update the service:
```bash
# Make your changes, then redeploy
./deploy.sh
```

The deployment will automatically create a new revision and route traffic to it.
