// src/main/java/com/polyglot/gateway/InferenceRepository.java
package com.polyglot.gateway;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface InferenceRepository extends JpaRepository<Inference, UUID> {
    List<Inference> findTop50ByOrderByCreatedAtDesc();
}
