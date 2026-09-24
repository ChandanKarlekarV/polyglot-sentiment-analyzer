#!/usr/bin/env bash

# ==============================================================================
# CAPSTONE ARCHITECTURE: DISTRIBUTED REAL-TIME WEB SENTIMENT ANALYZER
# LOCAL DEPLOYMENT & VERIFICATION SCRIPT
# Target File: deploy.sh
# ==============================================================================

set -euo pipefail

echo "=================================================================="
echo " INIT: Polyglot Distributed Sentiment Analyzer Deployment        "
echo "=================================================================="

# 1. Environment Verification
if [ ! -f .env ]; then
  echo "[FATAL] .env file not found. Generating template from .env.example..."
  cp .env.example .env
  echo "[ACTION REQUIRED] Populate .env with Supabase credentials and re-run."
  exit 1
fi

echo "[OK] Environment file detected."

# 2. Build Sequence using Docker BuildKit
echo "[BUILD] Constructing production multi-stage container images..."
DOCKER_BUILDKIT=1 docker compose build

# 3. Launch Message Broker and Microservices
echo "[ORCHESTRATION] Spinning up isolated container network..."
docker compose up -d

# 4. Health Verification Loop
echo "[HEALTHCHECK] Probing services..."
sleep 5

docker compose ps

echo "=================================================================="
echo " DEPLOYMENT COMPLETE                                              "
echo " Java API Gateway: http://localhost:8080/api/inferences           "
echo " Python AI EDA:    http://localhost:5000/api/internal/eda          "
echo " RabbitMQ UI:      http://localhost:15672 (admin/securepass123)   "
echo " Frontend UI:      http://localhost:3000                          "
echo "=================================================================="
