//! ==============================================================================
//! CAPSTONE ARCHITECTURE: DISTRIBUTED REAL-TIME WEB SENTIMENT ANALYZER
//! HIGH-SPEED PREPROCESSOR: Rust Multi-Threaded Engine
//! Target File: services/rust-preprocessor/src/main.rs
//! ==============================================================================

use std::collections::HashSet;
use std::env;
use std::sync::Arc;
use futures_lite::StreamExt;
use lapin::{
    options::{BasicAckOptions, BasicConsumeOptions, BasicQosOptions, QueueDeclareOptions},
    types::FieldTable,
    Connection, ConnectionProperties,
};
use rayon::prelude::*;
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION, CONTENT_TYPE};
use serde::{Deserialize, Serialize};

/// Incoming payload from Ruby scraper via RabbitMQ
#[derive(Debug, Deserialize)]
struct ScrapedPayload {
    article_id: String,
    source: String,
    url: String,
    title: String,
    raw_text: String,
    scraped_at: String,
}

/// Outgoing payload to Supabase processed_tokens table
#[derive(Debug, Serialize)]
struct ProcessedTokensPayload {
    article_id: String,
    cleaned_tokens: Vec<String>,
    token_count: usize,
}

/// Comprehensive stop-words lookup set for aggressive text normalization
fn build_stop_words() -> HashSet<&'static str> {
    let words = [
        "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
        "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
        "but", "by", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't",
        "doing", "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't",
        "has", "hasn't", "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here",
        "here's", "hers", "herself", "him", "himself", "his", "how", "how's", "i", "i'd", "i'll",
        "i'm", "i've", "if", "in", "into", "is", "isn't", "it", "it's", "its", "itself", "let's",
        "me", "more", "most", "mustn't", "my", "myself", "no", "nor", "not", "of", "off", "on",
        "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own",
        "same", "shan't", "she", "she'd", "she'll", "she's", "should", "shouldn't", "so", "some",
        "such", "than", "that", "that's", "the", "their", "theirs", "them", "themselves", "then",
        "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've", "this",
        "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
        "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's",
        "where", "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with",
        "won't", "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
        "yourself", "yourselves",
    ];
    words.into_iter().collect()
}

/// Multi-threaded aggressive text tokenizer and cleaner utilizing Rayon
fn clean_and_tokenize(text: &str, stop_words: &HashSet<&'static str>) -> Vec<String> {
    // Split on whitespace and non-letter boundaries
    let words: Vec<&str> = text.split(|c: char| !c.is_alphanumeric()).collect();

    // Parallel processing across CPU worker threads
    words
        .into_par_iter()
        .map(|w| w.to_lowercase())
        .filter(|w| {
            w.len() > 2
                && !stop_words.contains(w.as_str())
                && w.chars().any(|c| c.is_alphabetic())
        })
        .collect()
}

#[tokio::main]
async fn main() {
    println!("[PREPROCESSOR] Booting Rust High-Speed Tokenizer...");

    // -------------------------------------------------------------------------
    // 1. Environment Verification
    // -------------------------------------------------------------------------
    let rabbitmq_url = env::var("RABBITMQ_URL")
        .unwrap_or_else(|_| "amqp://admin:securepass123@rabbitmq:5672/".to_string());
    let queue_name = env::var("QUEUE_NAME")
        .unwrap_or_else(|_| "raw_text_stream".to_string());
    let supabase_url = env::var("SUPABASE_URL")
        .unwrap_or_else(|_| {
            eprintln!("[FATAL] Missing SUPABASE_URL environment variable.");
            std::process::exit(1);
        });
    let supabase_key = env::var("SUPABASE_SERVICE_ROLE_KEY")
        .unwrap_or_else(|_| {
            eprintln!("[FATAL] Missing SUPABASE_SERVICE_ROLE_KEY environment variable.");
            std::process::exit(1);
        });

    if let Ok(threads_str) = env::var("RAYON_NUM_THREADS") {
        if let Ok(threads) = threads_str.parse::<usize>() {
            rayon::ThreadPoolBuilder::new()
                .num_threads(threads)
                .build_global()
                .ok();
            println!("[PREPROCESSOR] Rayon thread pool configured: {} threads", threads);
        }
    }

    let stop_words = Arc::new(build_stop_words());

    // -------------------------------------------------------------------------
    // 2. HTTP Client Configuration for Supabase REST
    // -------------------------------------------------------------------------
    let mut default_headers = HeaderMap::new();
    default_headers.insert("apikey", HeaderValue::from_str(&supabase_key).unwrap());
    default_headers.insert(
        AUTHORIZATION,
        HeaderValue::from_str(&format!("Bearer {}", supabase_key)).unwrap(),
    );
    default_headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    default_headers.insert("Prefer", HeaderValue::from_static("return=minimal"));

    let http_client = reqwest::Client::builder()
        .default_headers(default_headers)
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .unwrap_or_else(|e| {
            eprintln!("[FATAL] Failed to build HTTP client: {:?}", e);
            std::process::exit(1);
        });

    // -------------------------------------------------------------------------
    // 3. Broker Connection with Explosive Error Handling
    // -------------------------------------------------------------------------
    println!("[PREPROCESSOR] Connecting to RabbitMQ at {}...", rabbitmq_url);
    let conn = Connection::connect(&rabbitmq_url, ConnectionProperties::default())
        .await
        .unwrap_or_else(|e| {
            eprintln!("[FATAL] RabbitMQ broker connection failure: {:?}", e);
            std::process::exit(1);
        });

    let channel = conn.create_channel().await.unwrap_or_else(|e| {
        eprintln!("[FATAL] Failed to create AMQP channel: {:?}", e);
        std::process::exit(1);
    });

    channel
        .queue_declare(
            &queue_name,
            QueueDeclareOptions {
                durable: true,
                ..QueueDeclareOptions::default()
            },
            FieldTable::default(),
        )
        .await
        .unwrap_or_else(|e| {
            eprintln!("[FATAL] Failed to declare queue {}: {:?}", queue_name, e);
            std::process::exit(1);
        });

    channel
        .basic_qos(16, BasicQosOptions::default())
        .await
        .unwrap_or_else(|e| {
            eprintln!("[FATAL] Failed to set basic QoS: {:?}", e);
            std::process::exit(1);
        });

    let mut consumer = channel
        .basic_consume(
            &queue_name,
            "rust_preprocessor_consumer",
            BasicConsumeOptions::default(),
            FieldTable::default(),
        )
        .await
        .unwrap_or_else(|e| {
            eprintln!("[FATAL] Failed to initialize consumer: {:?}", e);
            std::process::exit(1);
        });

    println!("[PREPROCESSOR] Listening on queue '{}' for inbound payloads...", queue_name);

    let supabase_tokens_endpoint = format!("{}/rest/v1/processed_tokens", supabase_url);

    // -------------------------------------------------------------------------
    // 4. Ingestion, Parallel Processing & Supabase Persistence Loop
    // -------------------------------------------------------------------------
    while let Some(delivery_result) = consumer.next().await {
        match delivery_result {
            Ok(delivery) => {
                let start_time = std::time::Instant::now();

                let payload_result: Result<ScrapedPayload, _> =
                    serde_json::from_slice(&delivery.data);

                match payload_result {
                    Ok(payload) => {
                        let article_id = payload.article_id.clone();
                        let raw_text = payload.raw_text;

                        // Parallel cleaning via Rayon
                        let cleaned = clean_and_tokenize(&raw_text, &stop_words);
                        let token_count = cleaned.len();
                        let elapsed_micros = start_time.elapsed().as_micros();

                        let db_payload = ProcessedTokensPayload {
                            article_id: article_id.clone(),
                            cleaned_tokens: cleaned,
                            token_count,
                        };

                        // Insert directly into Supabase central state
                        let response = http_client
                            .post(&supabase_tokens_endpoint)
                            .json(&db_payload)
                            .send()
                            .await;

                        match response {
                            Ok(res) if res.status().is_success() => {
                                println!(
                                    "[PREPROCESSOR] Tokenized [{}] -> {} tokens in {}µs. Supabase synced.",
                                    article_id, token_count, elapsed_micros
                                );

                                if let Err(e) = delivery.ack(BasicAckOptions::default()).await {
                                    eprintln!("[WARN] Failed to ack message: {:?}", e);
                                }
                            }
                            Ok(res) => {
                                eprintln!(
                                    "[FATAL] Supabase HTTP rejection: status={}, body={:?}",
                                    res.status(),
                                    res.text().await
                                );
                                std::process::exit(1);
                            }
                            Err(e) => {
                                eprintln!("[FATAL] Supabase network failure: {:?}", e);
                                std::process::exit(1);
                            }
                        }
                    }
                    Err(err) => {
                        eprintln!("[ERROR] Malformed JSON payload skipped: {:?}", err);
                        let _ = delivery.ack(BasicAckOptions::default()).await;
                    }
                }
            }
            Err(e) => {
                eprintln!("[FATAL] Delivery stream error: {:?}", e);
                std::process::exit(1);
            }
        }
    }
}
