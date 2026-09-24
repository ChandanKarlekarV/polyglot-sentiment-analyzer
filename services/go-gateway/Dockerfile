# ==============================================================================
# MULTI-STAGE DOCKERFILE: GO API GATEWAY & ROUTING LAYER
# Target File: services/go-gateway/Dockerfile
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Builder
# ------------------------------------------------------------------------------
FROM golang:1.22-alpine AS builder

WORKDIR /src

RUN apk add --no-cache git ca-certificates

COPY go.mod ./
RUN go mod download || go mod tidy

COPY main.go ./

# Compile statically linked binary with stripped debug symbols
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/go-gateway .

# ------------------------------------------------------------------------------
# Stage 2: Minimal Alpine Runtime
# ------------------------------------------------------------------------------
FROM alpine:3.20 AS runtime

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl

# Non-root user setup
RUN addgroup -S gogroup && adduser -S gouser -G gogroup

COPY --from=builder /app/go-gateway /app/go-gateway

RUN chown -R gouser:gogroup /app

USER gouser

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

CMD ["/app/go-gateway"]
