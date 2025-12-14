# LifeEmbedding - GCP Cloud Run Deployment Guide

This guide documents the complete deployment process for the LifeEmbedding application on Google Cloud Platform using Cloud Run.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Project Structure](#project-structure)
5. [Deployment Steps](#deployment-steps)
6. [Troubleshooting](#troubleshooting)
7. [Common Issues & Solutions](#common-issues--solutions)
8. [Maintenance](#maintenance)

---

## Application Overview

**LifeEmbedding** is a web application that visualizes life trajectories of historical figures in 3D space using embeddings. Users can:

- Explore 790+ historical figures plotted in 3D based on their life events
- View clusters of similar career trajectories
- Generate their own embedding to see where they fit among historical figures

### Tech Stack

| Component | Technology |
|-----------|------------|
| **Frontend** | React 18 + Vite + Tailwind CSS + Deck.gl (3D visualization) |
| **Backend** | FastAPI (Python) + Uvicorn |
| **Database** | Google BigQuery |
| **ML/Embeddings** | Google Vertex AI (text-embedding-004) |
| **Dimensionality Reduction** | PCA + UMAP (sklearn, umap-learn) |
| **Deployment** | Google Cloud Run (containerized) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GCP Cloud Run                           │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                   │
│  ┌─────────────────────┐    │    ┌─────────────────────────┐   │
│  │   Frontend Service  │    │    │   Backend Service       │   │
│  │   (lifeembedding-   │◄───┼───►│   (lifeembedding-       │   │
│  │    frontend)        │    │    │    backend)             │   │
│  │                     │    │    │                         │   │
│  │  - React + Vite     │    │    │  - FastAPI              │   │
│  │  - Nginx (static)   │    │    │  - PCA/UMAP models      │   │
│  │  - Port 8080        │    │    │  - Port 8080            │   │
│  └─────────────────────┘    │    └───────────┬─────────────┘   │
│                             │                │                  │
└─────────────────────────────┼────────────────┼──────────────────┘
                              │                │
                              │                ▼
                              │    ┌───────────────────────┐
                              │    │   Google BigQuery     │
                              │    │   (lifeembedding_data)│
                              │    │                       │
                              │    │  - persons            │
                              │    │  - embeddings         │
                              │    │  - coordinates_3d     │
                              │    │  - life_events        │
                              │    └───────────────────────┘
                              │                │
                              │                ▼
                              │    ┌───────────────────────┐
                              │    │   Google Vertex AI    │
                              │    │   (us-central1)       │
                              │    │                       │
                              │    │  - text-embedding-004 │
                              │    └───────────────────────┘
```

---

## Prerequisites

Before deploying, ensure you have:

1. **GCP Project** with billing enabled
   - Project ID: `lifeembedding`
   
2. **APIs Enabled:**
   - Cloud Run API
   - Cloud Build API
   - Artifact Registry API
   - BigQuery API
   - Vertex AI API

3. **Service Account** with permissions:
   - BigQuery Data Viewer
   - BigQuery Job User
   - Vertex AI User
   - Service Account: `lifeembedding-cloudrun@lifeembedding.iam.gserviceaccount.com`

4. **Data in BigQuery:**
   - Tables: `persons`, `embeddings`, `coordinates_3d`, `life_events`
   
5. **PCA/UMAP Models Generated:**
   - Files: `data/processed/pca_model.pkl`, `data/processed/umap_model.pkl`
   - Generated by running: `python scripts/dim_reduction.py`

---

## Project Structure

```
lifeembedding/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── database.py          # BigQuery connection
│   ├── embeddings.py        # Vertex AI + PCA/UMAP
│   ├── models.py            # Pydantic models
│   └── requirements.txt     # Python dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── services/api.js  # API client
│   │   └── utils/           # Utilities
│   ├── nginx.conf           # Nginx config for serving
│   ├── package.json         # Node dependencies
│   └── vite.config.js       # Vite configuration
│
├── data/
│   └── processed/
│       ├── pca_model.pkl    # Trained PCA model (REQUIRED)
│       └── umap_model.pkl   # Trained UMAP model (REQUIRED)
│
├── config.py                # GCP configuration
├── Dockerfile.backend       # Backend Docker image
├── Dockerfile.frontend      # Frontend Docker image
├── cloudbuild-backend.yaml  # Cloud Build config (backend)
├── cloudbuild-frontend.yaml # Cloud Build config (frontend)
├── .dockerignore            # Docker ignore rules
├── .gcloudignore            # Cloud Build ignore rules
└── DEPLOY.md                # This file
```

---

## Deployment Steps

### Step 1: Enable Required APIs

```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com
```

### Step 2: Create Artifact Registry Repository (First Time Only)

```bash
gcloud artifacts repositories create lifeembedding-repo \
    --repository-format=docker \
    --location=us-east1 \
    --description="LifeEmbedding Docker images"
```

### Step 3: Configure Docker Authentication

```bash
gcloud auth configure-docker us-east1-docker.pkg.dev --quiet
```

### Step 4: Generate PCA/UMAP Models (If Not Already Done)

```bash
cd /home/jupyter/lifeembedding

# Install required packages with correct versions
pip install scikit-learn==1.3.2 umap-learn==0.5.4

# Generate models
python scripts/dim_reduction.py

# Verify models exist
ls -la data/processed/*.pkl
```

**Expected output:**
```
-rw-r--r-- 1 jupyter jupyter XXXXX pca_model.pkl
-rw-r--r-- 1 jupyter jupyter XXXXX umap_model.pkl
```

### Step 5: Build and Deploy Backend

```bash
cd /home/jupyter/lifeembedding

# Build backend image
gcloud builds submit --config=cloudbuild-backend.yaml .

# Deploy backend to Cloud Run
gcloud run deploy lifeembedding-backend \
    --image us-east1-docker.pkg.dev/lifeembedding/lifeembedding-repo/backend:latest \
    --platform managed \
    --region us-east1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --service-account lifeembedding-cloudrun@lifeembedding.iam.gserviceaccount.com
```

**⚠️ IMPORTANT:** After deployment, note the backend URL:
```
Service URL: https://lifeembedding-backend-XXXXXX-ue.a.run.app
```

### Step 6: Test Backend Health

```bash
curl https://lifeembedding-backend-XXXXXX-ue.a.run.app/api/health
```

**Expected response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-02T17:40:00.000000",
  "version": "1.0.0",
  "services": {
    "bigquery": "healthy",
    "vertex_ai": "configured",
    "reduction_models": "loaded"    <-- MUST say "loaded"
  }
}
```

### Step 7: Build and Deploy Frontend

```bash
# Set the backend URL from Step 5
export BACKEND_URL="https://lifeembedding-backend-XXXXXX-ue.a.run.app"

# Build frontend image with backend URL baked in
gcloud builds submit \
    --config=cloudbuild-frontend.yaml \
    --substitutions=_VITE_API_URL="${BACKEND_URL}" \
    .

# Deploy frontend to Cloud Run
gcloud run deploy lifeembedding-frontend \
    --image us-east1-docker.pkg.dev/lifeembedding/lifeembedding-repo/frontend:latest \
    --platform managed \
    --region us-east1 \
    --allow-unauthenticated \
    --memory 256Mi
```

### Step 8: Access Your Application! 🎉

The frontend URL is your **public application URL**:
```
https://lifeembedding-frontend-XXXXXX-ue.a.run.app
```

Anyone with this URL can access and use the application!

---

## Troubleshooting

### View Backend Logs

```bash
gcloud run services logs read lifeembedding-backend --region us-east1 --limit 50
```

### View Frontend Logs

```bash
gcloud run services logs read lifeembedding-frontend --region us-east1 --limit 50
```

### Check Service Status

```bash
gcloud run services describe lifeembedding-backend --region us-east1
gcloud run services describe lifeembedding-frontend --region us-east1
```

### Redeploy After Changes

```bash
# Backend changes
gcloud builds submit --config=cloudbuild-backend.yaml .
gcloud run deploy lifeembedding-backend \
    --image us-east1-docker.pkg.dev/lifeembedding/lifeembedding-repo/backend:latest \
    --platform managed \
    --region us-east1 \
    --allow-unauthenticated \
    --memory 1Gi \
    --service-account lifeembedding-cloudrun@lifeembedding.iam.gserviceaccount.com

# Frontend changes
export BACKEND_URL="https://lifeembedding-backend-XXXXXX-ue.a.run.app"
gcloud builds submit --config=cloudbuild-frontend.yaml --substitutions=_VITE_API_URL="${BACKEND_URL}" .
gcloud run deploy lifeembedding-frontend \
    --image us-east1-docker.pkg.dev/lifeembedding/lifeembedding-repo/frontend:latest \
    --platform managed \
    --region us-east1 \
    --allow-unauthenticated \
    --memory 256Mi
```

---

## Common Issues & Solutions

### Issue 1: "reduction_models: not loaded"

**Symptom:** Health check shows `"reduction_models": "not loaded"`

**Cause:** PCA/UMAP model files are not in the Docker image

**Solution:**
1. Verify models exist locally:
   ```bash
   ls -la data/processed/*.pkl
   ```
2. If missing, generate them:
   ```bash
   pip install scikit-learn==1.3.2 umap-learn==0.5.4
   python scripts/dim_reduction.py
   ```
3. Rebuild and redeploy backend

---

### Issue 2: "code() argument 13 must be str, not int"

**Symptom:** Backend logs show this error when loading UMAP model

**Cause:** Python version mismatch. Models were pickled with Python 3.10 but container uses Python 3.11

**Solution:** Use Python 3.10 in the backend Dockerfile:
```dockerfile
FROM python:3.10-slim  # NOT python:3.11-slim
```

---

### Issue 3: Model Files Not Being Uploaded to Cloud Build

**Symptom:** Build succeeds but models are missing in container

**Cause:** `.gcloudignore` or `.dockerignore` excluding the files

**Solution:** Ensure `.gcloudignore` does NOT ignore `data/processed/`:
```
# Do NOT add these lines:
# data/
# data/processed/
# *.pkl
```

---

### Issue 4: User Embedding Appears Small/Invisible

**Symptom:** When generating user embedding, the gold point is barely visible

**Cause:** User's UMAP coordinates are too close to the data center, resulting in minimal extension

**Solution:** The frontend includes an automatic adjustment that scales up coordinates if they're too close to center. Ensure you have the latest `VisualizationView.jsx`.

---

### Issue 5: Frontend Can't Connect to Backend

**Symptom:** "Failed to load data" error in frontend

**Cause:** Wrong backend URL or CORS issue

**Solution:**
1. Verify backend is running: `curl $BACKEND_URL/api/health`
2. Ensure frontend was built with correct `VITE_API_URL`
3. Check that backend CORS allows all origins (already configured)

---

## Maintenance

### Updating the Application

1. Make code changes locally
2. Test locally if possible
3. Rebuild and redeploy affected service(s)

### Scaling

Cloud Run auto-scales based on traffic. To adjust limits:

```bash
gcloud run services update lifeembedding-backend \
    --region us-east1 \
    --min-instances 1 \
    --max-instances 10

gcloud run services update lifeembedding-frontend \
    --region us-east1 \
    --min-instances 1 \
    --max-instances 10
```

### Cleanup (Delete Everything)

```bash
# Delete services
gcloud run services delete lifeembedding-backend --region us-east1 --quiet
gcloud run services delete lifeembedding-frontend --region us-east1 --quiet

# Delete images
gcloud artifacts docker images delete \
    us-east1-docker.pkg.dev/lifeembedding/lifeembedding-repo/backend --quiet
gcloud artifacts docker images delete \
    us-east1-docker.pkg.dev/lifeembedding/lifeembedding-repo/frontend --quiet

# Delete repository (optional)
gcloud artifacts repositories delete lifeembedding-repo --location us-east1 --quiet
```

---

## Quick Reference

### URLs

| Service | URL |
|---------|-----|
| Frontend (Public App) | `https://lifeembedding-frontend-XXXXXX-ue.a.run.app` |
| Backend API | `https://lifeembedding-backend-XXXXXX-ue.a.run.app` |
| API Docs (Swagger) | `https://lifeembedding-backend-XXXXXX-ue.a.run.app/api/docs` |
| Health Check | `https://lifeembedding-backend-XXXXXX-ue.a.run.app/api/health` |

### Key Files

| File | Purpose |
|------|---------|
| `Dockerfile.backend` | Backend Docker image definition |
| `Dockerfile.frontend` | Frontend Docker image definition |
| `cloudbuild-backend.yaml` | Cloud Build config for backend |
| `cloudbuild-frontend.yaml` | Cloud Build config for frontend |
| `frontend/nginx.conf` | Nginx config for serving React SPA |
| `config.py` | GCP project configuration |

### Important Configuration

| Setting | Value |
|---------|-------|
| GCP Project | `lifeembedding` |
| Region | `us-east1` |
| Python Version | `3.10` (for pickle compatibility) |
| Backend Memory | `1Gi` |
| Frontend Memory | `256Mi` |

---

## Summary

The deployment process involves:

1. ✅ Enable GCP APIs
2. ✅ Create Artifact Registry repository
3. ✅ Generate PCA/UMAP models (if needed)
4. ✅ Build & deploy backend with models included
5. ✅ Verify backend health (models loaded)
6. ✅ Build & deploy frontend with backend URL
7. ✅ Access public URL and enjoy!

**Total deployment time:** ~10-15 minutes

---

*Last updated: December 2, 2025*
