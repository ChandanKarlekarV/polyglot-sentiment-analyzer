# Dockerfile
# Stage 1: Build the Application
FROM maven:3.9.4-eclipse-temurin-17 AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Compile the source code
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Runtime Environment
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Expose the API Gateway port
EXPOSE 8080

COPY --from=builder /app/target/java-gateway-1.0.0.jar app.jar

# Launch the Spring Boot application
CMD ["java", "-jar", "app.jar"]
