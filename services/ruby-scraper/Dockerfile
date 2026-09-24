# ==============================================================================
# MULTI-STAGE DOCKERFILE: RUBY DATA INGESTION ENGINE
# Target File: services/ruby-scraper/Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM ruby:3.3-slim AS builder

WORKDIR /app

# Install native dependencies required for Nokogiri compilation
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libxml2-dev \
      libxslt-dev \
      pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY Gemfile ./

# Configure bundler for production build and install gems
RUN bundle config set --global without 'development test' && \
    bundle config set --global jobs 4 && \
    bundle install && \
    rm -rf /usr/local/bundle/cache/*.gem && \
    find /usr/local/bundle/gems/ -name "*.c" -delete && \
    find /usr/local/bundle/gems/ -name "*.o" -delete

# ------------------------------------------------------------------------------
# Stage 2: Minimal Runtime
# ------------------------------------------------------------------------------
FROM ruby:3.3-slim AS runtime

WORKDIR /app

# Install minimal dynamic libraries for Nokogiri runtime
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      libxml2 \
      libxslt1.1 \
      ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy installed gems and binaries from builder
COPY --from=builder /usr/local/bundle /usr/local/bundle

# Create non-privileged service user
RUN groupadd -r rubyuser && useradd -r -g rubyuser -s /bin/false rubyuser

COPY scraper.rb ./

RUN chown -R rubyuser:rubyuser /app

USER rubyuser

ENV RUBY_ENV=production \
    RUBYUNBUFFERED=1

CMD ["ruby", "scraper.rb"]
