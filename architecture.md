# System Architecture: Distributed Real-Time Web Sentiment Analyzer

## 1. Architectural Philosophy & Polyglot Rationale
This architecture establishes a high-throughput, decoupled microservices fabric designed around domain-specific computing. Rather than forcing a single language into roles where it exhibits operational friction, the system strictly utilizes four foundational languages aligned with core computer science competencies:

1. **C++ (High-Speed Preprocessing & Ingestion):** Handles CPU-bound string tokenization, case normalization, and punctuation elimination without garbage collection pauses. Persists raw payloads to MongoDB and publishes clean strings to AMQP.
2. **Python (AI Inference & Exploratory Data Analysis):** Consumes AMQP payloads, extracts statistical feature vectors using TF-IDF, runs real-time sentiment classification via Logistic Regression, and aggregates live Exploratory Data Analysis (EDA) metrics with Pandas.
3. **Java / Spring Boot (Enterprise Gateway & Data Orchestrator):** Manages connection pooling, transactions, and object-relational mapping (Hibernate/JPA) to persist verified inference records to Supabase (PostgreSQL). Exposes high-concurrency REST endpoints with strict CORS.
4. **JavaScript / Next.js (Tactile Frontend Dashboard):** Delivers a "vintage diary" operational interface with real-time telemetry polling, animated AI background rendering, and a CSS-based film grain overlay.

---

## 2. Dual-Database Topology

The storage layer enforces strict segregation between unstructured raw archives and structured analytical state:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                             STORAGE TOPOLOGY                                │
├───────────────────────────────┬─────────────────────────────────────────────┤
│ NoSQL: MongoDB                │ SQL: PostgreSQL (Supabase)                  │
├───────────────────────────────┼─────────────────────────────────────────────┤
│ • Database: polyglot_db       │ • Schema: public                            │
│ • Collection: raw_corpus      │ • Tables: live_inferences, system_logs      │
│ • Role: Unstructured payload  │ • Role: Relational ML results, timestamps,  │
│   archiving, ingestion audit  │   confidence scores, and system telemetry   │
└───────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 3. Distributed Network Topography

```text
               [ Simulated Web Data Stream ]
                             │
                             ▼ (Internal Ingestion)
               ┌───────────────────────────┐
               │     C++ Preprocessor      │ ──▶ [ MongoDB: raw_corpus ]
               │  (Memory-Efficient O(N))  │
               └───────────────────────────┘
                             │
                             ▼ (AMQP: cleaned_text_stream)
               ┌───────────────────────────┐
               │  RabbitMQ Message Broker  │
               └───────────────────────────┘
                             │
                             ▼ (AMQP Consumer / Prefetch 1)
               ┌───────────────────────────┐
               │      Python AI Core       │ ──▶ [ In-Memory Pandas EDA ]
               │ (Scikit-Learn Classifier) │
               └───────────────────────────┘
                             │
                             ▼ (Internal REST POST /api/internal/inferences)
               ┌───────────────────────────┐
               │    Java Spring Gateway    │ ──▶ [ Supabase: live_inferences ]
               │ (JPA / Hibernate / JDBC)  │
               └───────────────────────────┘
                             ▲
                             │ (Public REST GET /api/inferences)
                             │ (Port 8080)
               ┌───────────────────────────┐
               │  Next.js Frontend Client  │
               │ (Vintage Diary Dashboard) │
               └───────────────────────────┘
```

---

## 4. Failure Isolation & Explosive Recovery (Antigravity Rule #4)

Each microservice container runs isolated on the `polyglot-net` bridge network:
* **Explosive Termination:** If any service loses its database connection or message broker connection, it crashes immediately with **exit code 1**.
* **Daemon Supervision:** The Docker daemon supervises containers and executes automated restarts, preventing silent degradation or memory leaks from stale socket connections.
