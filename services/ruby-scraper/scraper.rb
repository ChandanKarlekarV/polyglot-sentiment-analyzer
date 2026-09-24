# frozen_string_literal: true

# ==============================================================================
# CAPSTONE ARCHITECTURE: DISTRIBUTED REAL-TIME WEB SENTIMENT ANALYZER
# DATA INGESTION ENGINE: Ruby Worker
# Target File: services/ruby-scraper/scraper.rb
# ==============================================================================

require 'nokogiri'
require 'httparty'
require 'bunny'
require 'json'
require 'time'

# ------------------------------------------------------------------------------
# 1. Configuration & Environment Verification
# ------------------------------------------------------------------------------
RABBITMQ_URL       = ENV.fetch('RABBITMQ_URL', 'amqp://admin:securepass123@rabbitmq:5672/')
QUEUE_NAME         = ENV.fetch('QUEUE_NAME', 'raw_text_stream')
RSS_FEED_URL       = ENV.fetch('RSS_FEED_URL', 'https://feeds.bbci.co.uk/news/technology/rss.xml')
SUPABASE_URL       = ENV.fetch('SUPABASE_URL') { abort('[FATAL] Missing SUPABASE_URL environment variable') }
SUPABASE_KEY       = ENV.fetch('SUPABASE_SERVICE_ROLE_KEY') { abort('[FATAL] Missing SUPABASE_SERVICE_ROLE_KEY environment variable') }
SCRAPE_INTERVAL    = ENV.fetch('SCRAPE_INTERVAL_SECONDS', '60').to_i

# ------------------------------------------------------------------------------
# 2. Broker Connection with Explosive Error Handling
# ------------------------------------------------------------------------------
begin
  $stdout.puts "[INGEST] Connecting to RabbitMQ at #{RABBITMQ_URL}..."
  connection = Bunny.new(RABBITMQ_URL, automatically_recover: true, network_recovery_interval: 2)
  connection.start

  channel = connection.create_channel
  queue = channel.queue(QUEUE_NAME, durable: true)
  $stdout.puts "[INGEST] Successfully coupled to queue: #{QUEUE_NAME}"
rescue StandardError => e
  $stderr.puts "[FATAL] RabbitMQ broker connection failure: #{e.class} - #{e.message}"
  exit 1
end

# Graceful termination handling for container runtime
Signal.trap('TERM') do
  $stdout.puts '[INGEST] Received SIGTERM. Shutting down connection...'
  connection&.close
  exit 0
end

Signal.trap('INT') do
  $stdout.puts '[INGEST] Received SIGINT. Shutting down connection...'
  connection&.close
  exit 0
end

# ------------------------------------------------------------------------------
# 3. Helper Functions: Cleaning, Persisting, and Publishing
# ------------------------------------------------------------------------------
def sanitize_text(html_fragment)
  return '' if html_fragment.nil?

  doc = Nokogiri::HTML::DocumentFragment.parse(html_fragment)
  # Remove scripts, styles, and unwanted tags
  doc.css('script, style, noscript').remove
  text = doc.text
  # Normalize whitespace and line breaks
  text.gsub(/\s+/, ' ').strip
end

def persist_article_to_supabase(url, title, raw_text, source)
  endpoint = "#{SUPABASE_URL}/rest/v1/scraped_articles"
  headers = {
    'apikey' => SUPABASE_KEY,
    'Authorization' => "Bearer #{SUPABASE_KEY}",
    'Content-Type' => 'application/json',
    'Prefer' => 'return=representation,resolution=ignore-duplicates'
  }

  payload = {
    url: url,
    title: title,
    raw_text: raw_text,
    source: source,
    scraped_at: Time.now.utc.iso8601
  }

  response = HTTParty.post(
    endpoint,
    headers: headers,
    body: payload.to_json,
    timeout: 10
  )

  unless response.success?
    # If duplicate, query existing ID
    if response.code == 409 || response.body.include?('duplicate key')
      query_resp = HTTParty.get(
        "#{endpoint}?url=eq.#{URI.encode_www_form_component(url)}&select=id",
        headers: headers,
        timeout: 10
      )
      if query_resp.success? && !query_resp.parsed_response.empty?
        return query_resp.parsed_response.first['id']
      end
    end
    $stderr.puts "[FATAL] Supabase write failure: HTTP #{response.code} - #{response.body}"
    exit 1
  end

  records = response.parsed_response
  records.first['id'] if records.is_a?(Array) && !records.empty?
rescue StandardError => e
  $stderr.puts "[FATAL] Supabase connection failure: #{e.class} - #{e.message}"
  exit 1
end

# ------------------------------------------------------------------------------
# 4. Scraper Ingestion Cycle
# ------------------------------------------------------------------------------
$stdout.puts "[INGEST] Starting continuous ingestion daemon for #{RSS_FEED_URL}"

loop do
  $stdout.puts "[INGEST] [#{Time.now.utc.iso8601}] Initiating RSS harvest cycle..."

  begin
    feed_response = HTTParty.get(
      RSS_FEED_URL,
      headers: { 'User-Agent' => 'PolyglotSentimentBot/1.0 (Capstone Distributed AI Pipeline)' },
      timeout: 15
    )

    unless feed_response.success?
      $stderr.puts "[WARN] Failed to fetch RSS feed: HTTP #{feed_response.code}. Will retry next interval."
      sleep SCRAPE_INTERVAL
      next
    end

    xml = Nokogiri::XML(feed_response.body)
    items = xml.xpath('//item')
    $stdout.puts "[INGEST] Discovered #{items.size} articles in feed."

    items.each do |item|
      title = sanitize_text(item.xpath('title').text)
      link  = item.xpath('link').text.strip
      desc  = sanitize_text(item.xpath('description').text)

      next if link.empty? || title.empty?

      # Combine title and body text for rich sentiment analysis
      combined_text = "#{title}. #{desc}".strip

      # 1. Store state centrally in Supabase
      article_id = persist_article_to_supabase(link, title, combined_text, 'BBC News RSS')
      next unless article_id

      # 2. Package standardized JSON event payload
      event_payload = {
        article_id: article_id,
        source: 'BBC News RSS',
        url: link,
        title: title,
        raw_text: combined_text,
        scraped_at: Time.now.utc.iso8601
      }.to_json

      # 3. Publish to AMQP queue for downstream Rust processing
      queue.publish(
        event_payload,
        persistent: true,
        content_type: 'application/json'
      )

      $stdout.puts "[INGEST] Dispatched [#{article_id}] -> RabbitMQ '#{QUEUE_NAME}'"
    end
  rescue StandardError => e
    $stderr.puts "[ERROR] Unexpected failure in harvest cycle: #{e.class} - #{e.message}"
  end

  $stdout.puts "[INGEST] Ingestion cycle complete. Sleeping for #{SCRAPE_INTERVAL} seconds."
  sleep SCRAPE_INTERVAL
end
