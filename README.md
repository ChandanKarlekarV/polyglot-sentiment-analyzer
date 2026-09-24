# Polyglot AI Fabric // Real-Time Web Sentiment Analyzer

A heavily distributed, highly scalable machine learning pipeline demonstrating architectural mastery across multiple distinct programming domains. This Capstone project ingests unstructured data, performs high-speed text normalization, executes machine learning inference, and routes telemetry to a real-time web dashboard.

---

## 🏛 The Architecture & Domain Justification

This project intentionally avoids the standard "monolithic" approach (e.g., building everything in Python or Node.js) to demonstrate a deep understanding of *why* specific languages are chosen for specific tasks in enterprise environments.

### 1. The Data Ingestion Engine (C++ & MongoDB)
Text tokenization and normalization for massive datasets are heavily CPU-bound tasks.
* **The Engine:** A C++ microservice reads the raw data stream. It utilizes O(N) memory-efficient string manipulation to strip punctuation, normalize case, and prepare the text for the AI model without triggering the garbage collection pauses common in interpreted languages.
* **Storage:** The raw, unstructured payload is saved to **MongoDB** (Document DB) for archiving, while the cleaned string is pushed to a RabbitMQ message broker.

### 2. The AI Core & EDA (Python)
Machine learning requires a rich ecosystem of mathematical libraries.
* **The Engine:** A Python (FastAPI) service consumes the RabbitMQ stream. It runs Exploratory Data Analysis (EDA) using `pandas` and executes text classification via a `scikit-learn` pipeline (TF-IDF Vectorization & Logistic Regression).
* **Routing:** Once the sentiment confidence score is calculated, Python forwards the structured payload to the internal enterprise gateway.

### 3. The Enterprise API Gateway (Java / Spring Boot)
Handling concurrent HTTP requests and strict relational database mapping requires enterprise-grade routing.
* **The Engine:** A Java 17 Spring Boot application acts as the secure load balancer and API gateway. It enforces strict type safety and object-relational mapping (Hibernate) before persisting the final AI inference to the SQL database.
* **Storage:** Data is written to **Supabase (PostgreSQL)**, providing indexed, high-speed querying for the frontend.

### 4. The Telemetry Dashboard (JavaScript / Next.js)
The client interface demands high performance, edge caching, and a premium visual aesthetic.
* **The Engine:** A React/Next.js frontend polls the Java API Gateway. It features a custom-built, tactile "vintage ledger" UI utilizing CSS-based film grain, raw monospace fonts for telemetry data, and bespoke data visualization.

---

## ⚙️ System Topography

```text
[ Simulated Web Stream ] 
          │
          ▼ 
[ C++ (High-Speed Preprocessor) ] ──▶ (Document Storage) ──▶ [ MongoDB ]
          │
          ▼ (AMQP / RabbitMQ)
[ Python (Scikit-Learn AI Core) ]
          │
          ▼ (Internal REST)
[ Java (Spring Boot API Gateway) ] ──▶ (Relational Storage) ──▶ [ PostgreSQL / Supabase ]
          │
          ▼ (Public REST)
[ JavaScript (Next.js Dashboard) ]
```

---

## 🛠 Deployment Instructions

### Prerequisites
* Docker & Docker Compose installed.
* A Supabase account (or local PostgreSQL instance).

### 1. Database Initialization
Run the contents of [`schema.sql`](schema.sql) in your [Supabase SQL Editor](https://supabase.com).

### 2. Environment Setup
Create a `.env` file in the root directory (based on [`.env.example`](.env.example)):

```env
SUPABASE_URL=jdbc:postgresql://[YOUR_SUPABASE_HOST]:5432/postgres
SUPABASE_KEY=[YOUR_SUPABASE_PASSWORD]
```

### 3. Build & Launch
Build the container images and launch the multi-service fabric:

```bash
docker compose build
docker compose up -d
```

### 4. Service Endpoints
* **Vintage Ledger Frontend:** [http://localhost:3000](http://localhost:3000)
* **Java Enterprise Gateway:** [http://localhost:8080/api/inferences](http://localhost:8080/api/inferences)
* **Python AI Core (Live EDA):** [http://localhost:5000/api/internal/eda](http://localhost:5000/api/internal/eda)
* **RabbitMQ Management Dashboard:** [http://localhost:15672](http://localhost:15672) *(Credentials: admin / securepass123)*
* **MongoDB Ingestion Store:** `mongodb://admin:securepass123@localhost:27017`

---

## 🚀 Vercel Deployment Guide (`services/js-frontend`)

To deploy the frontend to Vercel while backed by the GitHub repository:

1. **Log in to Vercel:** Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
2. **Import Repository:** Select `ChandanKarlekarV/polyglot-sentiment-analyzer`.
3. **Configure Project Settings:**
   * **Framework Preset:** `Next.js`
   * **Root Directory:** Edit and set to `services/js-frontend`.
4. **Environment Variables:**
   * Add `NEXT_PUBLIC_API_URL` with your public Gateway URL (e.g. `https://your-java-gateway-url/api` or leave blank for automatic graceful fallback to demonstration telemetry).
5. **Deploy:** Click **"Deploy"**. Vercel will build and host the vintage diary dashboard on a global edge CDN.

---

## 🎯 Recruiter & Technical Interview Talking Points

* **Language Specialization vs. Monolithic Convenience:**
  * *"Why C++ for text normalization?"* C++ executes raw ASCII/UTF-8 character-level sanitization in $O(N)$ time with pre-allocated memory buffers (`std::string::reserve`), avoiding garbage collection latency spikes on high-volume streams.
  * *"Why Python for AI?"* Python hosts the richest data science and machine learning ecosystem (`pandas`, `scikit-learn`), enabling rapid feature extraction (TF-IDF) and fast vector mathematics.
  * *"Why Java / Spring Boot for the API Gateway?"* Spring Boot provides battle-tested JDBC connection pooling (HikariCP), strong type safety, and transactional consistency for high-concurrency enterprise data ingestion.
* **Dual-Database Architecture Rationale:**
  * Unstructured, schema-less raw scraped strings are permanently archived in **MongoDB** (`raw_corpus`), ensuring no incoming data is lost even if parsing rules evolve.
  * Structured predictions, confidence scores, and latency metrics are strictly persisted in **Supabase PostgreSQL** (`live_inferences`), optimized with B-tree indices for fast analytical slicing and frontend queries.
* **Resilience & Fault Tolerance:**
  * Microservices communicate asynchronously via durable RabbitMQ queues (`cleaned_text_stream`). If the AI service experiences temporary downtime, the C++ ingestion layer buffers messages without data loss.
  * Critical services follow a fail-fast design: unrecoverable broker or database disconnects trigger immediate exit code `1`, allowing Docker Compose or Kubernetes orchestrators to automatically restart healthy containers.

---

## 👨‍💻 Candidate Technical Profile

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                          CORE TECHNICAL PROFILE                               │
├───────────────────────┬───────────────────────────────────────────────────────┤
│ Programming Languages │ Python, C, C++, Java, JavaScript (ES6+)               │
│ Database Management   │ SQL (PostgreSQL / Supabase), MongoDB (NoSQL)          │
│ Web Technologies      │ HTML5, CSS3, JavaScript, React, Next.js 14, Tailwind  │
│ AI & ML (In Progress) │ Data Preprocessing, Basic Algorithms, EDA, ML models  │
└───────────────────────┴───────────────────────────────────────────────────────┘
```

