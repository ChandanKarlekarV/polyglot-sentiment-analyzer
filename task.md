# Polyglot Pipeline: Master Task Tracker

## Phase 1: Documentation & Infrastructure
- [x] Write `architecture.md` defining C++, Python, Java, JavaScript, MongoDB, and Supabase topology.
- [x] Write `prd.md` specifying system goals, scope, and operational metrics.
- [x] Write `task.md` outlining phase milestones and deliverables.
- [x] Write `api-contracts.md` defining AMQP payloads, REST schemas, and database contracts.
- [x] Write `ui-ux-design-system.md` detailing the tactile vintage diary aesthetic.
- [x] Generate `schema.sql` for Supabase PostgreSQL (`live_inferences` and `system_logs`).
- [x] Generate master `docker-compose.yml` orchestrating RabbitMQ, MongoDB, C++, Python, Java, and JS Frontend.
- [x] Configure `.env.example` and verified `.env` files.

---

## Phase 2: High-Speed Preprocessor (C++)
- [x] Implement `services/cpp-preprocessor/main.cpp` with O(N) string cleaning.
- [x] Integrate MongoDB C++ driver (`mongocxx` / `bsoncxx`) to persist raw unstructured text.
- [x] Integrate RabbitMQ C++ client (`SimpleAmqpClient`) to publish cleaned text to `cleaned_text_stream`.
- [x] Write `services/cpp-preprocessor/CMakeLists.txt` for driver linking.
- [x] Construct multi-stage `services/cpp-preprocessor/Dockerfile` with driver compilation.

---

## Phase 3: The AI Core (Python)
- [x] Implement `services/python-inference/main.py` using FastAPI and Pika.
- [x] Train startup TF-IDF Vectorizer + Logistic Regression classification pipeline.
- [x] Establish AMQP consumer listening on `cleaned_text_stream`.
- [x] Implement in-memory Pandas buffer for live Exploratory Data Analysis (`/api/internal/eda`).
- [x] Forward structured inferences to Java Gateway via HTTP POST.
- [x] Construct `services/python-inference/requirements.txt` and `Dockerfile`.

---

## Phase 4: Enterprise API Gateway (Java / Spring Boot)
- [x] Generate Maven build `services/java-gateway/pom.xml` with Spring Boot Web, Data JPA, and PostgreSQL driver.
- [x] Configure `services/java-gateway/src/main/resources/application.properties` with JDBC connection pooling.
- [x] Define JPA Entity `Inference.java` mapped to Supabase `live_inferences`.
- [x] Implement `InferenceRepository.java` with `findTop50ByOrderByCreatedAtDesc`.
- [x] Implement `InferenceController.java` with internal ingest endpoint and public CORS endpoint.
- [x] Construct multi-stage `services/java-gateway/Dockerfile` using Eclipse Temurin 17 JRE.

---

## Phase 5: The Frontend Dashboard (JavaScript / Next.js)
- [ ] Build Next.js 14 application in `services/js-frontend/`.
- [ ] Configure `tailwind.config.js` with custom ledger palette (`#141210`, `#1a1715`, `#3e3832`, `#ece8e1`, `#f9a826`).
- [ ] Implement CSS-based subtle film grain overlay in `app/globals.css`.
- [ ] Develop `app/page.jsx` with real-time polling to Java Gateway (`/api/inferences`).
- [ ] Implement fallback mock data for visual demonstration when offline.
- [ ] Add Author Dossier displaying candidate skills: Python, C, C++, Java, JS, SQL, MongoDB.
- [ ] Construct `services/js-frontend/Dockerfile`.

---

## Phase 6: DevOps and Presentation
- [ ] Write flagship `README.md` with architectural diagrams and recruiter interview talking points.
- [ ] Write automated `deploy.sh` script for local Docker Compose execution.
- [ ] Push clean codebase to GitHub repository `ChandanKarlekarV/polyglot-sentiment-analyzer`.
- [ ] Configure Vercel deployment pipeline for `services/js-frontend`.
