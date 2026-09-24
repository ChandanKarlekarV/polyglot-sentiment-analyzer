// src/main/java/com/polyglot/gateway/GatewayApplication.java
package com.polyglot.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class GatewayApplication {
    public static void main(String[] args) {
        System.out.println("[SYSTEM] Enterprise API Gateway Booting...");
        SpringApplication.run(GatewayApplication.class, args);
    }
}
