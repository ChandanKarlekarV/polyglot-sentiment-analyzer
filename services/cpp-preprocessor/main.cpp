// main.cpp
#include <iostream>
#include <string>
#include <algorithm>
#include <cctype>
#include <thread>
#include <chrono>
#include <cstdlib>
#include <stdexcept>
#include <vector>

#include <bsoncxx/builder/stream/document.hpp>
#include <bsoncxx/json.hpp>
#include <mongocxx/client.hpp>
#include <mongocxx/instance.hpp>
#include <mongocxx/uri.hpp>
#include <SimpleAmqpClient/SimpleAmqpClient.h>

using namespace std::chrono_literals;

// High-speed O(N) C++ string cleaning
std::string clean_text(const std::string& input) {
    std::string output;
    output.reserve(input.size());
    for (char c : input) {
        if (std::isalnum(c) || std::isspace(c)) {
            output += std::tolower(c);
        }
    }
    return output;
}

int main() {
    try {
        // 1. Environment Validation
        const char* mongo_url = std::getenv("MONGO_URL");
        if (!mongo_url) {
            throw std::runtime_error("Missing environment variable: MONGO_URL");
        }

        // 2. Database Connection (MongoDB)
        mongocxx::instance instance{};
        mongocxx::client mongo_client{mongocxx::uri{mongo_url}};
        auto db = mongo_client["polyglot_db"];
        auto collection = db["raw_corpus"];

        // 3. Message Broker Connection (RabbitMQ)
        // Hardcoded hostname matching docker-compose for demonstration; production uses AMQP URI parser
        AmqpClient::Channel::ptr_t mq_channel = AmqpClient::Channel::Create("rabbitmq", 5672, "admin", "securepass123");
        mq_channel->DeclareQueue("cleaned_text_stream", false, true, false, false);

        std::cout << "[SYSTEM] C++ Preprocessor connected to MongoDB and RabbitMQ." << std::endl;

        // Simulated Data Ingestion Stream
        std::vector<std::string> mock_payloads = {
            "BREAKING: The new AI features in Next.js 14 are absolutely AMAZING!! 10/10.",
            "Terrible experience with the new API update... my servers crashed. #Disappointed",
            "Market analysis indicates a strong bullish trend for Q4 tech stocks."
        };

        size_t index = 0;
        while (true) {
            std::string raw_text = mock_payloads[index % mock_payloads.size()];
            index++;

            // Step A: Store Unstructured Data in MongoDB
            auto builder = bsoncxx::builder::stream::document{};
            bsoncxx::document::value doc_value = builder
                << "raw_text" << raw_text
                << "source" << "simulated_web_stream"
                << "ingested_at" << bsoncxx::types::b_date(std::chrono::system_clock::now())
                << bsoncxx::builder::stream::finalize;
            
            collection.insert_one(doc_value.view());

            // Step B: Heavy Preprocessing (C++ Memory Efficiency)
            std::string cleaned_text = clean_text(raw_text);

            // Step C: Push Structured Payload to AMQP
            AmqpClient::BasicMessage::ptr_t message = AmqpClient::BasicMessage::Create(cleaned_text);
            mq_channel->BasicPublish("", "cleaned_text_stream", message);

            std::cout << "[TELEMETRY] Tokenized & Dispatched: " << cleaned_text << std::endl;
            std::this_thread::sleep_for(3000ms);
        }

    } catch (const std::exception& e) {
        std::cerr << "[FATAL] Service failure: " << e.what() << std::endl;
        return 1; // Explodes loudly for Docker Daemon auto-restart
    }

    return 0;
}
