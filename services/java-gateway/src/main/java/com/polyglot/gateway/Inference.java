// src/main/java/com/polyglot/gateway/Inference.java
package com.polyglot.gateway;

import jakarta.persistence.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "live_inferences")
public class Inference {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @Column(name = "original_text")
    private String originalText;
    
    @Column(name = "sentiment_classification")
    private String sentimentClassification;
    
    @Column(name = "confidence_score")
    private Double confidenceScore;
    
    @Column(name = "processing_time_ms")
    private Integer processingTimeMs;
    
    @Column(name = "created_at", insertable = false, updatable = false)
    private ZonedDateTime createdAt;

    // Standard Getters and Setters
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getOriginalText() { return originalText; }
    public void setOriginalText(String originalText) { this.originalText = originalText; }

    public String getSentimentClassification() { return sentimentClassification; }
    public void setSentimentClassification(String sentimentClassification) { this.sentimentClassification = sentimentClassification; }

    public Double getConfidenceScore() { return confidenceScore; }
    public void setConfidenceScore(Double confidenceScore) { this.confidenceScore = confidenceScore; }

    public Integer getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(Integer processingTimeMs) { this.processingTimeMs = processingTimeMs; }

    public ZonedDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(ZonedDateTime createdAt) { this.createdAt = createdAt; }
}
