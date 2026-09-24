# ==============================================================================
# CAPSTONE ARCHITECTURE: DISTRIBUTED REAL-TIME WEB SENTIMENT ANALYZER
# AI SENTIMENT CORE: Python / PyTorch / FastAPI / DistilBERT
# Target File: services/python-ai/main.py
# ==============================================================================

import os
import sys
import time
from contextlib import asynccontextmanager
from typing import Optional

import httpx
import torch
from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from transformers import AutoModelForSequenceClassification, AutoTokenizer

# ------------------------------------------------------------------------------
# 1. Environment & Configuration Verification
# ------------------------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "distilbert-base-uncased-finetuned-sst-2-english")
PORT = int(os.getenv("PORT", "8000"))

if not SUPABASE_URL or not SUPABASE_KEY:
    sys.stderr.write("[FATAL] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables.\n")
    sys.exit(1)

# Global model state holders
tokenizer = None
model = None
http_client: Optional[httpx.AsyncClient] = None

# ------------------------------------------------------------------------------
# 2. Application Lifespan (Model Loading & Warmup)
# ------------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    global tokenizer, model, http_client
    sys.stdout.write(f"[AI-CORE] Loading PyTorch neural model '{MODEL_NAME}' into CPU memory...\n")
    sys.stdout.flush()

    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
        model.eval()  # Set to inference mode

        # Warmup pass to eliminate initial JIT/allocation latency
        inputs = tokenizer("Pipeline operational test.", return_tensors="pt")
        with torch.no_grad():
            _ = model(**inputs)

        sys.stdout.write("[AI-CORE] PyTorch DistilBERT model initialized and warmed up successfully.\n")
    except Exception as e:
        sys.stderr.write(f"[FATAL] Failed to load PyTorch model weights: {e}\n")
        sys.exit(1)

    # Initialize shared HTTP client for Supabase REST calls
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation",
    }
    http_client = httpx.AsyncClient(
        base_url=f"{SUPABASE_URL}/rest/v1",
        headers=headers,
        timeout=10.0,
    )

    # Pre-flight check: Verify Supabase connectivity
    try:
        health_resp = await http_client.get("/live_inferences?select=id&limit=1")
        if health_resp.status_code not in (200, 206):
            sys.stderr.write(f"[FATAL] Supabase pre-flight probe failed: HTTP {health_resp.status_code} - {health_resp.text}\n")
            sys.exit(1)
        sys.stdout.write("[AI-CORE] Verified active connectivity to Supabase PostgreSQL state.\n")
        sys.stdout.flush()
    except Exception as exc:
        sys.stderr.write(f"[FATAL] Supabase database unreachable during startup: {exc}\n")
        sys.exit(1)

    yield

    # Clean shutdown
    if http_client:
        await http_client.aclose()
    sys.stdout.write("[AI-CORE] Inference engine terminated cleanly.\n")


app = FastAPI(
    title="Polyglot AI Sentiment Core",
    version="1.0.0",
    lifespan=lifespan,
)

# ------------------------------------------------------------------------------
# 3. Request / Response Data Contracts
# ------------------------------------------------------------------------------
class PredictRequest(BaseModel):
    article_id: Optional[str] = Field(None, description="UUID of the parent scraped article")
    text: str = Field(..., min_length=1, max_length=10000, description="Cleaned text to evaluate")


class PredictResponse(BaseModel):
    id: str
    article_id: Optional[str]
    sentiment_label: str
    confidence_score: float
    inference_latency_ms: int
    model_version: str

# ------------------------------------------------------------------------------
# 4. REST Endpoints
# ------------------------------------------------------------------------------
@app.get("/health", status_code=status.HTTP_200_OK)
async def health_check():
    return {
        "status": "HEALTHY",
        "model": MODEL_NAME,
        "device": "cpu",
        "timestamp": time.time(),
    }


@app.post("/predict", response_model=PredictResponse, status_code=status.HTTP_201_CREATED)
async def predict_sentiment(req: PredictRequest):
    if not model or not tokenizer or not http_client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Neural model or database pool is not yet initialized",
        )

    start_perf = time.perf_counter()

    # 1. Tokenize text with 512 max length constraint
    inputs = tokenizer(
        req.text,
        return_tensors="pt",
        truncation=True,
        max_length=512,
        padding=False,
    )

    # 2. PyTorch Tensor Inference
    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probabilities = torch.softmax(logits, dim=-1)[0]

    # DistilBERT SST-2 Mapping: Index 0 = NEGATIVE, Index 1 = POSITIVE
    neg_score = float(probabilities[0])
    pos_score = float(probabilities[1])

    if pos_score >= neg_score:
        sentiment_label = "POSITIVE"
        confidence_score = round(pos_score, 4)
    else:
        sentiment_label = "NEGATIVE"
        confidence_score = round(neg_score, 4)

    latency_ms = int((time.perf_counter() - start_perf) * 1000)

    # 3. Direct persistence to central Supabase state (Antigravity Rule #2)
    db_payload = {
        "article_id": req.article_id,
        "sentiment_label": sentiment_label,
        "confidence_score": confidence_score,
        "inference_latency_ms": latency_ms,
        "model_version": MODEL_NAME,
    }

    try:
        db_response = await http_client.post("/live_inferences", json=db_payload)

        if db_response.status_code not in (200, 201):
            sys.stderr.write(f"[FATAL] Supabase write failed: HTTP {db_response.status_code} - {db_response.text}\n")
            sys.stderr.flush()
            # Explosive failure on database state desynchronization
            sys.exit(1)

        inserted_records = db_response.json()
        inference_id = inserted_records[0]["id"] if inserted_records else "generated-uuid"

    except httpx.RequestError as exc:
        sys.stderr.write(f"[FATAL] Database connection dropped during live inference write: {exc}\n")
        sys.stderr.flush()
        sys.exit(1)

    return PredictResponse(
        id=inference_id,
        article_id=req.article_id,
        sentiment_label=sentiment_label,
        confidence_score=confidence_score,
        inference_latency_ms=latency_ms,
        model_version=MODEL_NAME,
    )
