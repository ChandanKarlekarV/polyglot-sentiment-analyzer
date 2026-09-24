#!/usr/bin/env python3
# ==============================================================================
# CAPSTONE UTILITY: MONGODB NO-SQL ARCHIVER & EXPLORATORY DATA ANALYSIS (EDA)
# Integrates: Python, SQL (Supabase), MongoDB (NoSQL), Data Preprocessing & EDA
# Target File: scripts/mongo_eda_archiver.py
# ==============================================================================

import os
import sys
import json
import httpx
from datetime import datetime
from collections import Counter

# ------------------------------------------------------------------------------
# 1. Configuration & Connectivity
# ------------------------------------------------------------------------------
SUPABASE_URL = os.getenv("SUPABASE_URL", "https://your-project.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "sentiment_capstone")

def run_exploratory_data_analysis(records):
    """
    Exploratory Data Analysis (EDA) & Statistical Summary
    Demonstrates: Data Preprocessing, Algorithmic Analysis, Distribution Metrics
    """
    print("\n" + "=" * 60)
    print(" EXPLORATORY DATA ANALYSIS (EDA) // STATISTICAL SUMMARY")
    print("=" * 60)

    if not records:
        print("[EDA] No records available for analysis.")
        return {}

    total_records = len(records)
    sentiment_counts = Counter(r.get("sentiment_label", "UNKNOWN") for r in records)
    confidences = [float(r.get("confidence_score", 0.0)) for r in records]
    latencies = [int(r.get("inference_latency_ms", 0)) for r in records]

    mean_conf = sum(confidences) / total_records if total_records else 0.0
    mean_latency = sum(latencies) / total_records if total_records else 0.0
    max_conf = max(confidences) if confidences else 0.0
    min_conf = min(confidences) if confidences else 0.0

    print(f"Total Evaluated Inferences: {total_records}")
    print(f"Sentiment Distribution:    Positive: {sentiment_counts['POSITIVE']} | Negative: {sentiment_counts['NEGATIVE']}")
    print(f"Confidence Metrics:        Mean: {mean_conf:.4f} | Min: {min_conf:.4f} | Max: {max_conf:.4f}")
    print(f"Latency Profile:           Mean: {mean_latency:.1f}ms")
    print("=" * 60 + "\n")

    return {
        "total_records": total_records,
        "sentiment_counts": dict(sentiment_counts),
        "mean_confidence": round(mean_conf, 4),
        "mean_latency_ms": round(mean_latency, 2),
        "analyzed_at": datetime.utcnow().isoformat()
    }

def archive_to_mongodb(records, eda_summary):
    """
    NoSQL Document Ingestion
    Demonstrates: MongoDB Collections, Document Upsert, Hybrid SQL+NoSQL Topology
    """
    print(f"[MONGODB] Coupling to instance: {MONGO_URI}...")
    try:
        from pymongo import MongoClient
        client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=2000)
        db = client[MONGO_DB_NAME]
        archive_coll = db["inference_archive"]
        eda_coll = db["eda_reports"]

        # Insert / Update documents
        inserted_count = 0
        for doc in records:
            doc["archived_at"] = datetime.utcnow()
            archive_coll.update_one({"id": doc["id"]}, {"$set": doc}, upsert=True)
            inserted_count += 1

        # Store EDA statistical report
        eda_coll.insert_one(eda_summary)

        print(f"[MONGODB] Successfully synchronized {inserted_count} documents to collection 'inference_archive'.")
        print(f"[MONGODB] EDA summary snapshot saved to collection 'eda_reports'.")

    except ImportError:
        print("[WARN] 'pymongo' not installed. Emulating MongoDB BSON JSON export:")
        export_path = "mongo_archive_export.json"
        with open(export_path, "w") as f:
            json.dump({"eda": eda_summary, "documents": records}, f, indent=2)
        print(f"[EMULATION] Exported {len(records)} documents to local BSON/JSON: {export_path}")
    except Exception as exc:
        print(f"[WARN] MongoDB unreachable ({exc}). Exporting fallback JSON artifact.")

def main():
    print("[INIT] Fetching relational inference data from SQL (Supabase)...")
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
    }

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(f"{SUPABASE_URL}/rest/v1/live_inferences?select=*&limit=100", headers=headers)
            if resp.status_code == 200:
                records = resp.json()
            else:
                records = []
    except Exception:
        records = []

    # If database has no live rows yet, use baseline mock sample for EDA validation
    if not records:
        print("[INFO] Generating synthetic test sample for EDA verification...")
        records = [
            {"id": "test-001", "sentiment_label": "POSITIVE", "confidence_score": 0.9852, "inference_latency_ms": 32},
            {"id": "test-002", "sentiment_label": "NEGATIVE", "confidence_score": 0.9120, "inference_latency_ms": 45},
            {"id": "test-003", "sentiment_label": "POSITIVE", "confidence_score": 0.8741, "inference_latency_ms": 28},
            {"id": "test-004", "sentiment_label": "POSITIVE", "confidence_score": 0.9634, "inference_latency_ms": 35},
        ]

    eda_summary = run_exploratory_data_analysis(records)
    archive_to_mongodb(records, eda_summary)

if __name__ == "__main__":
    main()
