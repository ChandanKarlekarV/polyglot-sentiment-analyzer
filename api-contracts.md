# API Contracts & Data Shapes: The Polyglot Pipeline

## 1. AMQP Message Contract: C++ Preprocessor ➔ Python AI Core

* **Queue Name:** `cleaned_text_stream`
* **Exchange:** `""` (Default direct exchange)
* **Delivery Mode:** Non-persistent / Fast In-Memory (or durable)
* **Encoding:** Plain UTF-8 String

### Payload Sample:
```text
breaking the new ai features in nextjs 14 are absolutely amazing 1010
```

---

## 2. Internal REST Contract: Python AI Core ➔ Java API Gateway

* **Method:** `POST`
* **Endpoint:** `http://java-gateway:8080/api/internal/inferences`
* **Headers:** `Content-Type: application/json`

### Request Body (JSON):
```json
{
  "original_text": "breaking the new ai features in nextjs 14 are absolutely amazing 1010",
  "sentiment_classification": "POSITIVE",
  "confidence_score": 0.9421,
  "processing_time_ms": 12
}
```

### Response (HTTP 200 OK):
```json
{
  "id": "7b3c2e14-d890-4e31-8f52-16a928e3b4a1",
  "originalText": "breaking the new ai features in nextjs 14 are absolutely amazing 1010",
  "sentimentClassification": "POSITIVE",
  "confidenceScore": 0.9421,
  "processingTimeMs": 12,
  "createdAt": "2026-09-24T14:38:12.451Z"
}
```

---

## 3. Public REST Contract: Java API Gateway ➔ JavaScript Next.js Frontend

* **Method:** `GET`
* **Endpoint:** `http://localhost:8080/api/inferences`
* **CORS:** Enabled (`Access-Control-Allow-Origin: *`)
* **Headers:** `Accept: application/json`

### Response (HTTP 200 OK):
```json
[
  {
    "id": "7b3c2e14-d890-4e31-8f52-16a928e3b4a1",
    "originalText": "breaking the new ai features in nextjs 14 are absolutely amazing 1010",
    "sentimentClassification": "POSITIVE",
    "confidenceScore": 0.9421,
    "processingTimeMs": 12,
    "createdAt": "2026-09-24T14:38:12.451Z"
  }
]
```

---

## 4. Internal EDA Contract: Python AI Core Telemetry

* **Method:** `GET`
* **Endpoint:** `http://localhost:5000/api/internal/eda`

### Response (HTTP 200 OK):
```json
{
  "total_processed": 142,
  "class_distribution": {
    "POSITIVE": 98,
    "NEGATIVE": 44
  },
  "average_confidence": 0.9142
}
```

---

## 5. Storage Schemas

### MongoDB Document Schema: `polyglot_db.raw_corpus`
```json
{
  "_id": { "$oid": "66f2dd41b8a92e10a4e8d321" },
  "raw_text": "BREAKING: The new AI features in Next.js 14 are absolutely AMAZING!! 10/10.",
  "source": "simulated_web_stream",
  "ingested_at": { "$date": "2026-09-24T14:38:00.000Z" }
}
```

### PostgreSQL Schema: `public.live_inferences` (Supabase)
```sql
CREATE TABLE public.live_inferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_text TEXT NOT NULL,
    sentiment_classification VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5, 4) NOT NULL,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
