# Day 1 - Architecture & Planning

## Project Goal

Build a production-style API Observability Platform capable of monitoring APIs, processing health checks asynchronously, and storing monitoring data efficiently.

## Problem Statement

Modern applications depend on multiple APIs and services. Monitoring their health, availability, and performance is critical for reliability.

Instead of building a simple uptime checker, I want to understand how real-world backend systems are designed and operated.

## Initial Requirements

* Monitor API endpoints
* Process monitoring jobs asynchronously
* Store monitoring results
* Support scalability
* Containerized local development environment
* Foundation for analytics and dashboards

## High-Level Architecture

Client → API Service → RabbitMQ → Consumer Service

Supporting Infrastructure:

* PostgreSQL
* MongoDB
* RabbitMQ
* Docker
* pgAdmin

## Technology Decisions

### RabbitMQ

Used to decouple monitoring requests from processing.

This allows the API layer to remain responsive while background workers handle monitoring tasks asynchronously.

### PostgreSQL

Will store structured application data such as users, monitors, and configurations.

### MongoDB

Will store high-volume monitoring results and logs.

### Docker

Provides a reproducible environment and avoids local setup inconsistencies.

## What I Built

* Project structure
* Dependency setup
* Dockerfile
* Dockerfile.consumer
* docker-compose.yml
* MongoDB container
* PostgreSQL container
* RabbitMQ container
* pgAdmin container

## Challenges Faced

While setting up Docker, I encountered build failures caused by an empty Dockerfile and missing environment variables.

Debugging containerization issues early reinforced the importance of validating infrastructure before writing application logic.

## Key Learning

Building infrastructure first provides a strong foundation and exposes deployment-related issues much earlier in the development process.

## Next Step

Build the configuration layer and establish connections with MongoDB, PostgreSQL, and RabbitMQ.
