-- schema.sql
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: live_inferences (Structured ML results)
CREATE TABLE public.live_inferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_text TEXT NOT NULL,
    sentiment_classification VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5, 4) NOT NULL,
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: system_logs (Telemetry and error tracking)
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_name VARCHAR(50) NOT NULL,
    log_level VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast frontend dashboard queries
CREATE INDEX idx_inferences_created_at ON public.live_inferences(created_at DESC);
CREATE INDEX idx_logs_created_at ON public.system_logs(created_at DESC);
