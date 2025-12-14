# filepath: /home/jupyter/lifeembedding/config.py
"""
LifeEmbedding Project Configuration
"""

# GCP Project Settings
PROJECT_ID = 'lifeembedding'
PROJECT_NUMBER = '573524866065'
REGION = 'us-east1'  # Primary region for services (aligned with Workbench)
WORKBENCH_ZONE = 'us-east1-b'  # Workbench instance location

# BigQuery Settings
DATASET_ID = 'lifeembedding_data'
DATASET_LOCATION = 'us-east1'  # Keep in same region as Workbench for performance

# Vertex AI Settings
VERTEX_AI_REGION = 'us-central1'  # Vertex AI embeddings (us-central1 has good availability)
EMBEDDING_MODEL = 'text-embedding-004'
EMBEDDING_DIMENSION = 768

# Service Account
SERVICE_ACCOUNT_EMAIL = 'lifeembedding-cloudrun@lifeembedding.iam.gserviceaccount.com'

# API Settings (for later)
API_VERSION = 'v1'

# Paths
DATA_DIR = '/home/jupyter/lifeembedding/data'
LOGS_DIR = '/home/jupyter/lifeembedding/logs'

print(f"✅ Configuration loaded for project: {PROJECT_ID}")