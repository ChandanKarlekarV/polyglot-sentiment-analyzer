// src/main/java/com/polyglot/gateway/InferenceController.java
package com.polyglot.gateway;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Enables frontend dashboard access
public class InferenceController {

    @Autowired
    private InferenceRepository repository;

    // Internal endpoint used strictly by the Python AI Core
    @PostMapping("/internal/inferences")
    public ResponseEntity<Inference> saveInference(@RequestBody Inference inference) {
        try {
            Inference saved = repository.save(inference);
            System.out.println("[TELEMETRY] Successfully routed and persisted prediction: " + saved.getSentimentClassification());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            System.err.println("[ERROR] Database persistence failed: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // Public endpoint exposed to the Next.js Frontend
    @GetMapping("/inferences")
    public ResponseEntity<List<Inference>> getLatestInferences() {
        return ResponseEntity.ok(repository.findTop50ByOrderByCreatedAtDesc());
    }
}
