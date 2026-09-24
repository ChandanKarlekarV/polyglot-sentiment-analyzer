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
Build the images and spin up the multi-container fabric:

```bash

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
