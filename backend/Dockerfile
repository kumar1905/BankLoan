# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM maven:3.9.6-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml and download dependencies first (layer caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and build the JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ─── Stage 2: Run ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Create a directory for uploaded files
RUN mkdir -p /app/uploads

# Copy only the built JAR from the build stage
COPY --from=build /app/target/loan-processing-0.0.1-SNAPSHOT.jar app.jar

# Expose the backend port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
