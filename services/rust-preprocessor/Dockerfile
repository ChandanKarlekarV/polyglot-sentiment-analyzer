# ==============================================================================
# MULTI-STAGE DOCKERFILE: RUST HIGH-SPEED PREPROCESSOR
# Target File: services/rust-preprocessor/Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Dependency Cache & Compilation
# ------------------------------------------------------------------------------
FROM rust:1.78-slim-bookworm AS builder

WORKDIR /usr/src/app

# Install compilation prerequisites
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      pkg-config \
      libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Pre-compile dependencies using a dummy entrypoint for caching
COPY Cargo.toml ./
RUN mkdir src && \
    echo "fn main() {}" > src/main.rs && \
    cargo build --release && \
    rm -rf src

# Copy real source code and perform production compile
COPY src ./src
RUN touch src/main.rs && \
    cargo build --release && \
    strip target/release/rust-preprocessor

# ------------------------------------------------------------------------------
# Stage 2: Minimal Distroless Runtime
# ------------------------------------------------------------------------------
FROM debian:bookworm-slim AS runtime

WORKDIR /app

# Install SSL runtime libraries for HTTPS Supabase communication
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Non-root unprivileged security configuration
RUN groupadd -r rustuser && useradd -r -g rustuser -s /bin/false rustuser

COPY --from=builder /usr/src/app/target/release/rust-preprocessor /usr/local/bin/rust-preprocessor

USER rustuser

ENV RUST_LOG=info \
    RAYON_NUM_THREADS=4

CMD ["rust-preprocessor"]
