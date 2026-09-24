// ==============================================================================
// CAPSTONE ARCHITECTURE: DISTRIBUTED REAL-TIME WEB SENTIMENT ANALYZER
// API ROUTING LAYER: Go / Gin Engine
// Target File: services/go-gateway/main.go
// ==============================================================================

package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// -----------------------------------------------------------------------------
// 1. Data Contracts & Models
// -----------------------------------------------------------------------------

type LiveInference struct {
	ID                 string    `json:"id"`
	ArticleID          *string   `json:"article_id"`
	SentimentLabel     string    `json:"sentiment_label"`
	ConfidenceScore    float64   `json:"confidence_score"`
	InferenceLatencyMs int       `json:"inference_latency_ms"`
	ModelVersion       string    `json:"model_version"`
	CreatedAt          time.Time `json:"created_at"`
}

type PredictRequest struct {
	ArticleID *string `json:"article_id,omitempty"`
	Text      string  `json:"text" binding:"required"`
}

type GatewayStats struct {
	TotalSampled    int     `json:"total_sampled"`
	PositiveCount   int     `json:"positive_count"`
	NegativeCount   int     `json:"negative_count"`
	NeutralCount    int     `json:"neutral_count"`
	AverageLatency  float64 `json:"average_latency_ms"`
	MeanConfidence  float64 `json:"mean_confidence"`
}

// -----------------------------------------------------------------------------
// 2. IP-Based Token-Bucket Rate Limiter
// -----------------------------------------------------------------------------

type IPRateLimiter struct {
	ips sync.Map
	r   rate.Limit
	b   int
}

func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	limiter := &IPRateLimiter{
		r: r,
		b: b,
	}

	// Background cleanup of stale IP buckets every 10 minutes
	go func() {
		for {
			time.Sleep(10 * time.Minute)
			limiter.ips = sync.Map{}
		}
	}()

	return limiter
}

func (i *IPRateLimiter) GetLimiter(ip string) *rate.Limiter {
	val, exists := i.ips.Load(ip)
	if !exists {
		l := rate.NewLimiter(i.r, i.b)
		i.ips.Store(ip, l)
		return l
	}
	return val.(*rate.Limiter)
}

func RateLimitMiddleware(limiter *IPRateLimiter) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		if !limiter.GetLimiter(ip).Allow() {
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":   "Rate limit exceeded. Maximum 20 req/s with burst of 40.",
				"status":  http.StatusTooManyRequests,
				"retry_in": "1s",
			})
			return
		}
		c.Next()
	}
}

// -----------------------------------------------------------------------------
// 3. Supabase REST Client Integration
// -----------------------------------------------------------------------------

type SupabaseClient struct {
	baseURL    string
	apiKey     string
	httpClient *http.Client
}

func NewSupabaseClient(url, key string) *SupabaseClient {
	return &SupabaseClient{
		baseURL: url,
		apiKey:  key,
		httpClient: &http.Client{
			Timeout: 10 * time.Second,
		},
	}
}

func (s *SupabaseClient) VerifyConnection() error {
	reqURL := fmt.Sprintf("%s/rest/v1/live_inferences?select=id&limit=1", s.baseURL)
	req, err := http.NewRequest(http.MethodGet, reqURL, nil)
	if err != nil {
		return err
	}

	req.Header.Set("apikey", s.apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("HTTP %d: %s", resp.StatusCode, string(body))
	}

	return nil
}

func (s *SupabaseClient) FetchLatestInferences(limit int) ([]LiveInference, error) {
	reqURL := fmt.Sprintf(
		"%s/rest/v1/live_inferences?select=id,article_id,sentiment_label,confidence_score,inference_latency_ms,model_version,created_at&order=created_at.desc&limit=%d",
		s.baseURL,
		limit,
	)

	req, err := http.NewRequest(http.MethodGet, reqURL, nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("apikey", s.apiKey)
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", s.apiKey))
	req.Header.Set("Accept", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("supabase returned HTTP %d: %s", resp.StatusCode, string(body))
	}

	var inferences []LiveInference
	if err := json.NewDecoder(resp.Body).Decode(&inferences); err != nil {
		return nil, err
	}

	return inferences, nil
}

// -----------------------------------------------------------------------------
// 4. Main Gateway Lifecycle
// -----------------------------------------------------------------------------

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	supabaseURL := os.Getenv("SUPABASE_URL")
	supabaseKey := os.Getenv("SUPABASE_ANON_KEY")
	if supabaseKey == "" {
		supabaseKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
	}

	pythonAIURL := os.Getenv("PYTHON_AI_URL")
	if pythonAIURL == "" {
		pythonAIURL = "http://python-ai:8000"
	}

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "*"
	}

	if supabaseURL == "" || supabaseKey == "" {
		fmt.Fprintln(os.Stderr, "[FATAL] Missing SUPABASE_URL or SUPABASE_KEY environment variables.")
		os.Exit(1)
	}

	// 1. Pre-flight verification of Supabase connectivity (Antigravity Rule #4)
	supabase := NewSupabaseClient(supabaseURL, supabaseKey)
	log.Printf("[GATEWAY] Testing connection to central Supabase state at %s...", supabaseURL)
	if err := supabase.VerifyConnection(); err != nil {
		fmt.Fprintf(os.Stderr, "[FATAL] Supabase state unreachable on boot: %v\n", err)
		os.Exit(1)
	}
	log.Println("[GATEWAY] Connection to Supabase database confirmed.")

	// 2. Initialize Gin Engine
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		return fmt.Sprintf("[GATEWAY] %s | %d | %s | %s | %s\n",
			param.TimeStamp.Format("15:04:05"),
			param.StatusCode,
			param.Latency,
			param.Method,
			param.Path,
		)
	}))

	// 3. Strict CORS Middleware
	corsConfig := cors.Config{
		AllowOrigins:     []string{allowedOrigin, "http://localhost:3000", "http://127.0.0.1:3000"},
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "apikey"},
		ExposeHeaders:    []string{"Content-Length", "X-RateLimit-Limit", "X-RateLimit-Remaining"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	if allowedOrigin == "*" {
		corsConfig.AllowAllOrigins = true
		corsConfig.AllowOrigins = nil
	}
	router.Use(cors.New(corsConfig))

	// 4. Rate Limiting Middleware (20 RPS, 40 Burst per IP)
	rateLimiter := NewIPRateLimiter(20, 40)
	router.Use(RateLimitMiddleware(rateLimiter))

	// -------------------------------------------------------------------------
	// 5. REST Route Handlers
	// -------------------------------------------------------------------------

	// Health Check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":    "UP",
			"service":   "sentiment-go-gateway",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
		})
	})

	// Fetch Latest 50 Inferences (Strict Phase 5 Contract)
	router.GET("/api/v1/inferences", func(c *gin.Context) {
		inferences, err := supabase.FetchLatestInferences(50)
		if err != nil {
			log.Printf("[ERROR] Failed to query Supabase live_inferences: %v", err)
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Failed to fetch inferences from central database",
				"details": err.Error(),
			})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"count": len(inferences),
			"data":  inferences,
		})
	})

	// Aggregated Analytics Summary
	router.GET("/api/v1/stats", func(c *gin.Context) {
		inferences, err := supabase.FetchLatestInferences(50)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{"error": err.Error()})
			return
		}

		stats := GatewayStats{TotalSampled: len(inferences)}
		if len(inferences) == 0 {
			c.JSON(http.StatusOK, stats)
			return
		}

		var totalLatency int
		var totalConfidence float64

		for _, inf := range inferences {
			totalLatency += inf.InferenceLatencyMs
			totalConfidence += inf.ConfidenceScore

			switch inf.SentimentLabel {
			case "POSITIVE":
				stats.PositiveCount++
			case "NEGATIVE":
				stats.NegativeCount++
			default:
				stats.NeutralCount++
			}
		}

		stats.AverageLatency = float64(totalLatency) / float64(len(inferences))
		stats.MeanConfidence = totalConfidence / float64(len(inferences))

		c.JSON(http.StatusOK, stats)
	})

	// Reverse Proxy to Python AI Core (/predict)
	router.POST("/api/v1/predict", func(c *gin.Context) {
		var reqBody PredictRequest
		if err := c.ShouldBindJSON(&reqBody); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body: 'text' field is required"})
			return
		}

		payloadBytes, _ := json.Marshal(reqBody)
		proxyURL := fmt.Sprintf("%s/predict", pythonAIURL)

		proxyReq, err := http.NewRequestWithContext(c.Request.Context(), http.MethodPost, proxyURL, bytes.NewBuffer(payloadBytes))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create proxy request"})
			return
		}
		proxyReq.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 15 * time.Second}
		resp, err := client.Do(proxyReq)
		if err != nil {
			c.JSON(http.StatusBadGateway, gin.H{
				"error":   "Failed to communicate with downstream Python AI service",
				"details": err.Error(),
			})
			return
		}
		defer resp.Body.Close()

		c.Status(resp.StatusCode)
		io.Copy(c.Writer, resp.Body)
	})

	// -------------------------------------------------------------------------
	// 6. Graceful Server Shutdown
	// -------------------------------------------------------------------------
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%s", port),
		Handler: router,
	}

	go func() {
		log.Printf("[GATEWAY] Go API Gateway active on http://0.0.0.0:%s", port)
		if err := srv.ListenAndServe(); err != nil && err != nil && err != http.ErrServerClosed {
			fmt.Fprintf(os.Stderr, "[FATAL] Gateway server listen error: %v\n", err)
			os.Exit(1)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("[GATEWAY] Shutdown signal received. Draining connections...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("[GATEWAY] Server forced to shutdown: %v", err)
	}

	log.Println("[GATEWAY] Server exited cleanly.")
}
