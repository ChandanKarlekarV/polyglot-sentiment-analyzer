# Polyglot Distributed Sentiment Fabric

<div align="center">

[![Microservices Architecture](https://img.shields.io/badge/Architecture-Event--Driven%20Microservices-blue.svg?style=for-the-badge)](#-system-architecture)
[![Tech Stack](https://img.shields.io/badge/Stack-C%2B%2B17%20%7C%20Python%20%7C%20Java%2017%20%7C%20Next.js-orange.svg?style=for-the-badge)](#-technology-matrix--domain-separation)
[![Dual Database](https://img.shields.io/badge/Storage-MongoDB%20%2B%20Supabase%20PostgreSQL-green.svg?style=for-the-badge)](#-dual-database-persistence)
[![Deployment](https://img.shields.io/badge/Deploy-Docker%20%2B%20Vercel-black.svg?style=for-the-badge)](#-deployment-guide)

**An enterprise-grade, distributed real-time sentiment analysis engine orchestrating multi-language microservices over AMQP message brokers, dual-tier persistence, and a high-fidelity edge telemetry dashboard.**

[System Architecture](#-system-architecture) • [Technology Matrix](#-technology-matrix--domain-separation) • [API & Event Contracts](#-api--event-contracts) • [Local Orchestration](#-local-orchestration) • [Vercel Deployment](#-vercel-deployment) • [Technical Dossier](#-candidate-technical-dossier)

</div>

---

## Executive Summary

The **Polyglot Distributed Sentiment Fabric** is a flagship distributed computing system built to demonstrate architectural discipline across specialized language runtimes. Rather than relying on a monolithic framework, each subsystem is isolated into a dedicated Docker microservice selected strictly for its optimal computational domain:

* **Zero-Copy Ingestion & Normalization (`C++17`):** High-throughput, garbage-collection-free character sanitization in $O(N)$ algorithmic complexity with persistent document buffering into **MongoDB**.
* **Asynchronous Message Broker (`RabbitMQ / AMQP`):** Decoupled, backpressure-resilient queuing guaranteeing zero message drops between ingestion spikes and downstream consumers.
* **AI Inference Core & Live EDA (`Python 3.11 / FastAPI`):** Pipeline executing Scikit-Learn TF-IDF vectorization and Logistic Regression classification, backed by an in-memory Pandas buffer exposing live Exploratory Data Analysis telemetry.
* **Enterprise Ingress & Relational Persistence (`Java 17 / Spring Boot 3`):** High-concurrency API gateway utilizing Spring Data JPA and HikariCP connection pooling to enforce relational constraints in **Supabase PostgreSQL**.
* **Edge Telemetry Dashboard (`JavaScript / Next.js 14`):** Real-time, reactive status console featuring a bespoke, tactile "vintage ledger" aesthetic, SVG film grain overlays, and sub-second polling.

---

## 🏛 System Architecture

The following diagram illustrates the unidirectional data pipeline, asynchronous messaging boundaries, and isolated persistence layers across the containerized cluster:

```mermaid
flowchart TD
    subgraph Ingestion ["Ingestion & Preprocessing Tier"]
        WS["Raw Web Stream / Telemetry Generator"] -->|"Unstructured Text"| CPP["C++17 Preprocessor Service"]
        CPP -->|"BSON Document Insert"| MONGO[("MongoDB\n(raw_corpus)")]
        CPP -->|"O(N) Cleaned String\nAMQP Publish"| AMQP{{"RabbitMQ Broker\nQueue: cleaned_text_stream"}}
    end

    subgraph Intelligence ["Inference & Analytical Tier"]
        AMQP -->|"AMQP Consume\nPrefetch: 1"| PY["Python 3.11 AI Core\n(FastAPI + Scikit-Learn)"]
        PY -->|"Buffer Telemetry"| EDA["Pandas In-Memory Buffer\nGET /api/internal/eda"]
        PY -->|"HTTP POST JSON\nStructured Inference"| JAVA["Java 17 Gateway\n(Spring Boot 3)"]
    end

    subgraph Persistence ["Relational Ingress & Enterprise Storage Tier"]
        JAVA -->|"HikariCP Pool\nSpring Data JPA"| PG[("Supabase PostgreSQL\n(live_inferences)")]
    end

    subgraph Presentation ["Client Edge Tier"]
        PG -.->|"Indexed B-Tree Queries"| JAVA
        JAVA -->|"HTTP GET /api/inferences\nCORS Enabled"| JS["Next.js 14 Dashboard\n(Vercel Edge / Docker)"]
        JS -->|"Real-Time Visual Stream"| CLIENT(["Operator Console / Vintage Ledger UI"])
    end

    classDef cTier fill:#1a1715,stroke:#3e3832,stroke-width:2px,color:#ece8e1;
    classDef storage fill:#241f1c,stroke:#f9a826,stroke-width:2px,color:#f9a826;
    class Ingestion,Intelligence,Persistence,Presentation cTier;
    class MONGO,PG storage;
```

---

## 🔬 Technology Matrix & Domain Separation

| Microservice | Technology Stack | Computational Role | Key Libraries & Drivers |
| :--- | :--- | :--- | :--- |
| **`cpp-preprocessor`** | **C++17**, GCC, CMake | High-speed string parsing, zero GC pauses, document archiving | `mongocxx`, `bsoncxx`, `SimpleAmqpClient` |
| **`python-inference`** | **Python 3.11**, FastAPI | NLP vectorization, supervised inference, live exploratory analytics | `scikit-learn`, `pandas`, `pika`, `uvicorn` |
| **`java-gateway`** | **Java 17**, Spring Boot 3 | Enterprise transaction boundary, connection pooling, CORS ingress | `spring-boot-starter-data-jpa`, `postgresql` |
| **`js-frontend`** | **JavaScript (ES6+)**, Next.js 14 | Responsive ledger interface, tactile aesthetics, telemetry polling | `react`, `react-dom`, `tailwindcss`, `postcss` |
| **`message-broker`** | **RabbitMQ (AMQP 0-9-1)** | Asynchronous stream decoupling and guaranteed delivery | Alpine Linux base, Management UI |
| **`document-store`** | **MongoDB 7.0** | Raw schema-less ingest archive (`raw_corpus`) | Official MongoDB Docker Container |
| **`relational-store`** | **PostgreSQL (Supabase)** | Normalized schema with B-Tree indices (`live_inferences`) | Cloud-hosted managed PostgreSQL 15 |

---

## 🗄 Dual-Database Persistence Model

The architecture enforces a strict distinction between raw ingested unstructured payloads and structured analytical outcomes:

### 1. Document Archive (`MongoDB: polyglot_db.raw_corpus`)
Captures raw scraped strings at point of ingestion before normalization. This ensures zero data loss if downstream machine learning tokenizers or schemas require backfilling:
```json
{
  "_id": { "$oid": "66f44d9b2e88a129d8b1e4a1" },
  "raw_text": "BREAKING: The new AI features in Next.js 14 are absolutely AMAZING!! 10/10.",
  "source": "simulated_web_stream",
  "ingested_at": { "$date": "2026-09-24T14:40:00.000Z" }
}
```

### 2. Relational Analytics Engine (`Supabase PostgreSQL`)
Enforces relational integrity, validation constraints, and high-performance querying for the operational dashboard:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.live_inferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_text TEXT NOT NULL,
    sentiment_classification VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5, 4) NOT NULL,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inferences_created_at 
ON public.live_inferences (created_at DESC);
```

---

## 📡 API & Event Contracts

### AMQP Queue Specification
* **Queue Name:** `cleaned_text_stream`
* **Durable:** `true`
* **Payload Type:** Plaintext UTF-8 string (preprocessed lowercase alphanumeric tokens).
* **Delivery Mode:** Persistent, explicit consumer manual acknowledgement (`basic_ack`).

### REST Internal Ingress Contract
* **Route:** `POST /api/internal/inferences`
* **Source:** `python-inference` $\rightarrow$ **Target:** `java-gateway`
```json
{
  "original_text": "breaking the new ai features in nextjs 14 are absolutely amazing 1010",
  "sentiment_classification": "POSITIVE",
  "confidence_score": 0.9421,
  "processing_time_ms": 12
}
```

### REST Public Telemetry Contract
* **Route:** `GET /api/inferences`
* **Source:** `js-frontend` $\rightarrow$ **Target:** `java-gateway`
* **Response:** Array of the latest 50 inferences sorted by `created_at DESC`.

### Analytical EDA Endpoint
* **Route:** `GET /api/internal/eda`
* **Target:** `python-inference` (Port 5000)
* **Response:** Real-time distribution counts and running average confidence scores computed by Pandas over in-memory ring buffers.

---

## 💻 Local Orchestration

### Prerequisites
* [Docker Desktop](https://www.docker.com/) (version 24+ recommended with Docker Compose v2).
* Active Supabase project (or local PostgreSQL instance).

### Step 1: Environment Configuration
Copy the template configuration and specify your Supabase connection string:
```bash
cp .env.example .env
```
Populate `.env` with your verified database credentials:
```env
SUPABASE_URL=jdbc:postgresql://db.pnqvxjnonviadtrvguzi.supabase.co:5432/postgres
SUPABASE_KEY=YourSupabaseDatabasePassword
```

### Step 2: Database Schema Migration
Open the **Supabase SQL Editor** and execute the commands in [`schema.sql`](schema.sql) to initialize `live_inferences`, `system_logs`, and their indexing rules.

### Step 3: Launch Service Cluster
Run the automated deployment script or execute Docker Compose directly:
```bash
# Option A: Automated deployment & health verification
chmod +x deploy.sh
./deploy.sh

# Option B: Standard Docker Compose build and daemon start
docker compose build
docker compose up -d
```

### Step 4: Access Running Services
* **Next.js Telemetry Console:** [http://localhost:3000](http://localhost:3000)
* **Java Gateway Health & Inferences:** [http://localhost:8080/api/inferences](http://localhost:8080/api/inferences)
* **Python AI Core Exploratory Analysis:** [http://localhost:5000/api/internal/eda](http://localhost:5000/api/internal/eda)
* **RabbitMQ Management Dashboard:** [http://localhost:15672](http://localhost:15672) *(Credentials: `admin` / `securepass123`)*
* **MongoDB Instance:** `mongodb://admin:securepass123@localhost:27017`

---

## 🚀 Vercel Deployment

The frontend dashboard (`services/js-frontend`) is structured as an independent Next.js project optimized for edge deployment on Vercel.

### Continuous Deployment via Git
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select and import the GitHub repository: **`ChandanKarlekarV/polyglot-sentiment-analyzer`**.
3. In **Project Configuration**:
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Click **Edit** and set to `services/js-frontend`.
4. In **Environment Variables**:
   * Key: `NEXT_PUBLIC_API_URL`
   * Value: `https://your-public-java-gateway.com/api` *(Optional: If left unset, the UI automatically engages mock telemetry streaming for public demonstrations)*.
5. Click **Deploy**. Vercel will build the Next.js bundle and provide a secure, globally distributed HTTPS edge URL.

---

## 🎯 Architecture Review & Interview Discussion Points

### 1. Why decouple string normalization into C++ rather than Python?
> **Answer:** In high-volume text ingestion (such as Twitter firehoses or financial tickers), preprocessing generates millions of short-lived string allocations. In managed or interpreted runtimes like Python or Node.js, this causes frequent Garbage Collection pauses and substantial memory overhead. The C++ preprocessor performs in-place, zero-allocation sanitization with $O(N)$ algorithmic complexity, pre-allocates memory via `std::string::reserve`, and offloads pure clean tokens without impacting inference execution.

### 2. What justifies a dual-database approach (MongoDB + PostgreSQL)?
> **Answer:** Unstructured and structured data possess distinct lifecycle requirements. Raw text arrives in unpredictable formats; storing it in MongoDB allows schema flexibility and lossless archiving without migration friction. Conversely, downstream inferences require relational integrity, timestamp indexing for rapid range scans, and strict ACID guarantees for auditing. PostgreSQL (via Supabase) provides indexed B-Trees, transactional safety, and predictable query latencies for user-facing dashboards.

### 3. How does the system handle backpressure and service failure?
> **Answer:** RabbitMQ acts as an asynchronous buffer between the C++ producer and the Python consumer. Under peak load, incoming messages queue safely in memory/disk without overwhelming the ML inference worker. Both the C++ and Python services implement a fail-fast strategy: if database or broker connectivity is severed, services abort with exit code `1`, signaling the Docker orchestration layer to automatically restart or re-route containers.

---

## 👨‍💻 Candidate Technical Dossier

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                             ENGINEERING CAPABILITIES                              │
├────────────────────────┬──────────────────────────────────────────────────────────┤
│ Core Languages         │ Python, C, C++, Java, JavaScript (ES6+)                  │
│ Database Management    │ SQL (PostgreSQL, Supabase), MongoDB (NoSQL Document)     │
│ Architecture Paradigms │ Microservices, Event-Driven Messaging (AMQP), REST APIs │
│ Web & Interface Design │ React, Next.js 14 (App Router), Tailwind CSS, HTML5/CSS3 │
│ AI & Machine Learning  │ Data Preprocessing, TF-IDF, Logistic Regression, EDA     │
│ Cloud & DevOps         │ Docker, Multi-Stage Builds, Docker Compose, Git, Vercel  │
└────────────────────────┴──────────────────────────────────────────────────────────┘
```

**Repository:** [https://github.com/ChandanKarlekarV/polyglot-sentiment-analyzer](https://github.com/ChandanKarlekarV/polyglot-sentiment-analyzer)  
**Author:** Chandan Karlekar ([@ChandanKarlekarV](https://github.com/ChandanKarlekarV))
