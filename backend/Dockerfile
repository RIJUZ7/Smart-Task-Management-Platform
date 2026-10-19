# ==============================================================================
# TASKFORGE Backend - Multi-stage Production Container Build
# Target Architecture: Spring Boot 3.3.5 / OpenJDK 17 Runtime
# ==============================================================================

# Stage 1: Build stage with Maven and OpenJDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /workspace

# Cache dependency layer
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build production artifact
COPY src ./src
RUN mvn clean package -DskipTests -B

# Stage 2: Minimal Distroless / Temurin JRE Production Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Add unprivileged user for security hardening
RUN addgroup -S taskforge && adduser -S taskforge -G taskforge
USER taskforge:taskforge

COPY --from=builder /workspace/target/*.jar app.jar

ENV SPRING_PROFILES_ACTIVE=prod
ENV SERVER_PORT=8080

EXPOSE 8080

# Configure memory constraints and garbage collection optimization
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
