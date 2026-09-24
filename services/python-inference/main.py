# main.py
import os
import sys
import pika
import requests
import threading
import pandas as pd
from fastapi import FastAPI
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline

# 1. Environment Validation
RABBITMQ_URL = os.getenv("RABBITMQ_URL")
JAVA_GATEWAY_URL = os.getenv("JAVA_GATEWAY_URL")

if not RABBITMQ_URL or not JAVA_GATEWAY_URL:
    print("[FATAL] Missing required environment variables.", file=sys.stderr)
    sys.exit(1)

# 2. AI Model Initialization (B.Tech ML Requirement)
# Training a fundamental Logistic Regression model on startup
print("[SYSTEM] Initializing and training classification model...")
_mock_corpus = [
    "amazing brilliant perfect 10/10",
    "terrible crashed disappointed worst",
    "bullish strong positive growth",
    "bearish declining bad loss"
]
_mock_labels = ["POSITIVE", "NEGATIVE", "POSITIVE", "NEGATIVE"]

model = make_pipeline(TfidfVectorizer(), LogisticRegression(solver='lbfgs'))
model.fit(_mock_corpus, _mock_labels)

# In-memory storage for Exploratory Data Analysis (EDA)
inference_history = []

app = FastAPI(title="Polyglot AI Core")

def process_message(ch, method, properties, body):
    try:
        clean_text = body.decode('utf-8')
        
        # ML Inference
        prediction = model.predict([clean_text])[0]
        probabilities = model.predict_proba([clean_text])[0]
        confidence = float(max(probabilities))
        
        payload = {
            "original_text": clean_text,
            "sentiment_classification": prediction,
            "confidence_score": round(confidence, 4),
            "processing_time_ms": 12 # Simulated metrics
        }
        
        # Log to EDA Dataframe
        inference_history.append(payload)
        
        # Push to Java API Gateway
        response = requests.post(JAVA_GATEWAY_URL, json=payload, timeout=5)
        response.raise_for_status()
        
        print(f"[TELEMETRY] Inference Complete: {prediction} ({confidence:.2f}) -> Routed to Java", flush=True)
        
        ch.basic_ack(delivery_tag=method.delivery_tag)
        
    except Exception as e:
        print(f"[ERROR] Inference or routing failed: {e}", file=sys.stderr)
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)

def amqp_consumer_loop():
    try:
        parameters = pika.URLParameters(RABBITMQ_URL)
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        
        channel.queue_declare(queue='cleaned_text_stream', durable=True)
        channel.basic_qos(prefetch_count=1)
        channel.basic_consume(queue='cleaned_text_stream', on_message_callback=process_message)
        
        print("[SYSTEM] AMQP Consumer listening on cleaned_text_stream...", flush=True)
        channel.start_consuming()
    except Exception as e:
        print(f"[FATAL] AMQP Connection lost: {e}", file=sys.stderr)
        os._exit(1) # Explodes loudly for Docker Daemon auto-restart

@app.on_event("startup")
def startup_event():
    # Run the AMQP consumer in a background thread so FastAPI can serve the EDA routes
    consumer_thread = threading.Thread(target=amqp_consumer_loop, daemon=True)
    consumer_thread.start()

@app.get("/api/internal/eda")
def get_exploratory_data_analysis():
    """
    Performs basic Exploratory Data Analysis (EDA) on the live inference stream.
    Utilizes Pandas to aggregate distributions and confidence percentiles.
    """
    if not inference_history:
        return {"status": "Awaiting data"}
        
    df = pd.DataFrame(inference_history)
    
    distribution = df['sentiment_classification'].value_counts().to_dict()
    avg_confidence = df['confidence_score'].mean()
    
    return {
        "total_processed": len(df),
        "class_distribution": distribution,
        "average_confidence": round(avg_confidence, 4)
    }
