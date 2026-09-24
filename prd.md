# Product Requirements Document: Distributed Real-Time Web Sentiment Analyzer

## 1. Executive Summary & Project Goals
The Distributed Real-Time Web Sentiment Analyzer is a flagship Capstone engineering project demonstrating the decomposition of an end-to-end data science and web engineering pipeline into four decoupled, single-responsibility microservices.

### Primary Goals:
1. **Domain Isolation:** Restrict language choice to C++, Python, Java, and JavaScript where each language delivers peak architectural efficiency.
2. **Dual-Database Segregation:** Store high-volume raw unstructured payloads in MongoDB, while persisting structured inference outputs and telemetry in PostgreSQL (Supabase).
3. **Low Latency & High Resilience:** Maintain sub-50ms inference times, strict fail-fast error boundaries, and real-time dashboard telemetry.
4. **Distinctive Visual Aesthetic:** Provide a human-crafted "vintage diary" operational interface avoiding generic SaaS design patterns.

---

## 2. In-Scope & Out-of-Scope Requirements

### In-Scope:
* **C++ Preprocessor:** O(N) string cleansing, lowercase conversion, non-alphanumeric stripping, MongoDB raw document insertion, and AMQP event publishing.
* **Python AI Core:** AMQP message consumption, TF-IDF vectorization, Logistic Regression sentiment classification, Pandas-based live Exploratory Data Analysis (EDA), and internal REST routing.
* **Java Gateway:** Spring Boot REST endpoints, Hibernate/JPA relational persistence to Supabase, top-50 query extraction with sorting, and CORS enablement.
* **JavaScript Dashboard:** Next.js 14 client component, vintage diary aesthetic (deep blacks, warm greys, golden-orange highlights, film grain overlay), live telemetry polling, and candidate dossier display.
* **Docker Orchestration:** Single `docker-compose.yml` spinning up RabbitMQ, MongoDB, C++, Python, Java, and Next.js services on an isolated bridge network.

### Out-of-Scope:
* Distributed multi-node model training across GPU clusters.
* Third-party user authentication / multi-tenant billing tiers.
* Unapproved auxiliary languages (Go, Rust, Ruby).

---

## 3. Service Level Agreements (SLAs) & Key Metrics

* **C++ Processing Latency:** < 5ms per article payload.
* **AMQP Dispatch Latency:** < 10ms from ingestion to broker queue.
* **Python Inference Latency:** < 25ms per text sample using Scikit-Learn TF-IDF + Logistic Regression.
* **Java Database Persistence:** < 40ms to write and commit to Supabase PostgreSQL.
* **Dashboard Polling Cycle:** 3000ms real-time telemetry synchronization.
* **Crash Recovery Time:** < 3000ms automated container restart on explosive exit.

---

## 4. User Personas & Use Cases

* **As an Engineering Recruiter:** I want to inspect a clean polyglot microservice repository that proves mastery of C++, Python, Java, JavaScript, SQL, and MongoDB without architectural bloat.
* **As a Data Engineer:** I want raw unstructured text archived in MongoDB so that downstream ETL jobs can audit the original corpus without polluting relational tables.
* **As a Machine Learning Engineer:** I want to query the `/api/internal/eda` endpoint to inspect live class distributions and average confidence scores across incoming traffic.
* **As a Frontend Operator:** I want to monitor live sentiment streams in a high-contrast vintage diary interface with clear anomaly indicators.
