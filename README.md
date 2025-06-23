# Uber Clone — Microservice Architecture

Welcome to the **Uber Clone** project — a full-stack ride-sharing platform built using a microservice architecture. This project was designed to simulate key components of a production-grade distributed system, integrating multiple services, asynchronous messaging, and real-world scalability considerations.

## Project Overview

This Uber Clone breaks down the core functionalities of a ride-sharing platform into independent microservices. Each service is containerized using Docker and orchestrated via Kubernetes, allowing for independent deployment, scalability, and resilience.

## Tech Stack

### Backend
- **Node.js** with **Express.js** (REST APIs)
- **MongoDB** — for non-relational data (Customer, Driver, Rides, Admin profiles)
- **MySQL** — for billing to maintain ACID compliance and ensure payment integrity
- **Redis** — for caching driver locations and improving read performance
- **Apache Kafka** — for asynchronous messaging between services (ride requests, ride acceptances)
- **Docker** — containerization of each microservice
- **Kubernetes** — container orchestration for deployment and scaling

### Frontend
- **React.js** — for customer, driver, and admin portals
- **Redux** — for frontend state management
- **Map API Integration** — for real-time route mapping and price prediction visualization

### Machine Learning
- **ML Pricing Microservice** — Predicts dynamic ride prices based on distance, location, and historical data.

## Microservice Architecture

### Backend Microservices & Ports

| Service | Description | Port |
| --- | --- | --- |
| Customer Service | Handles customer accounts & ride requests | **5000** |
| Driver Service | Handles driver accounts & availability | **5001** |
| Admin Service | Admin controls and analytics | **5002** |
| Ride Service | Manages ride lifecycle and statuses | **5003** |
| Billing Service | Processes payments and charges | **5004** |
| ML Pricing Service | Predicts ride pricing using ML models | **8080** |

### Frontend Ports

| Frontend | Description | Port |
| --- | --- | --- |
| Customer Frontend | Customer web interface | **3000** |
| Driver Frontend | Driver web interface | **3001** |
| Admin Frontend | Admin web interface | **3002** |

## Key Features

- **Account Management:** Customers, drivers, and admins all have dedicated services and interfaces.
- **Ride Booking Flow:** End-to-end ride request, matching, and fulfillment.
- **Real-time Driver Location:** Cached using Redis for fast access.
- **Dynamic Pricing:** ML-powered price predictions based on real-time data.
- **Map Visualization:** Integrated map API for live route previews and pickup/drop-off points.
- **Asynchronous Communication:** Kafka-powered messaging for ride requests & driver responses.
- **Secure Billing System:** MySQL-backed billing microservice to ensure transactional integrity.
- **Containerized Deployment:** Dockerized services orchestrated with Kubernetes for scalable deployment.

## Project Setup

Each microservice has its own README with specific setup instructions. Generally, you'll need to:

1. Clone the repo and navigate into each service directory.
2. Set up environment variables as specified in each service’s README for a .env and .env.docker files.
3. Use Docker Compose or Kubernetes manifests for orchestration.
4. Install dependencies and run services on their recommended ports.

## Deployment

- **Local Development:** Docker Compose
- **Production Deployment:** Kubernetes cluster

## Future Improvements

- Authentication service centralization
- Load balancing for high availability
- CI/CD pipeline integration
- Monitoring (Prometheus, Grafana)
