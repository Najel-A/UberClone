# Uber Clone System Architecture

## Project Structure
```text
uber-clone/
│
├── frontend/ # Frontend microservices (React + Redux)
│ ├── customer-frontend/ # Customer UI
│ │ ├── public/ # Static assets
│ │ ├── src/
│ │ │ ├── components/ # Shared UI components
│ │ │ ├── customer/ # Customer features
│ │ │ │ ├── CustomerPage.js
│ │ │ │ ├── customerSlice.js
│ │ │ │ └── customerAPI.js
│ │ │ ├── app/ # Redux setup
│ │ │ │ ├── store.js
│ │ │ │ └── rootReducer.js
│ │ │ ├── utils/ # Helpers
│ │ │ ├── App.js # Main app
│ │ │ └── index.js # Entry point
│ │ ├── package.json
│ │ └── Dockerfile
│ │
│ ├── driver-frontend/ # Driver UI
│ │ └── [similar structure]
│ │
│ └── admin-frontend/ # Admin UI
│ └── [similar structure]
│
├── backend/ # Backend microservices
│ ├── ride-service/
│ │ ├── src/
│ │ │ ├── config/ # Configuration
│ │ │ │ ├── kafka.js
│ │ │ │ └── db.js
│ │ │ ├── kafka/ # Event streaming
│ │ │ │ ├── producer/
│ │ │ │ ├── consumer/
│ │ │ │ └── topics.js
│ │ │ ├── controllers/ # Route handlers
│ │ │ ├── services/ # Business logic
│ │ │ ├── models/ # Database schemas
│ │ │ ├── routes/ # API endpoints
│ │ │ ├── app.js # Express config
│ │ │ └── server.js # Entry point
│ │ ├── package.json
│ │ └── README.md
│ │
│ ├── driver-service/ # Driver management
│ ├── customer-service/ # Customer management
│ ├── admin-service/ # Admin functions
│ └── ml-service/ # Machine learning
│
├── k8s/ # Kubernetes configs
│ ├── customer-frontend-deployment.yaml
│ ├── driver-frontend-deployment.yaml
│ ├── admin-frontend-deployment.yaml
│ ├── ride-service-deployment.yaml
│ ├── [other service configs]
│
├── docs/ # Documentation
├── docker-compose.yml # Local development
├── .gitignore
└── README.md
```

## Key Components

### Frontend Services
- **Customer Portal**: Ride booking, tracking, payments
- **Driver App**: Ride acceptance, navigation, earnings
- **Admin Dashboard**: Analytics, user management

### Backend Services
- **Ride Service**: Core ride management
- **Driver Service**: Driver profiles/status
- **Customer Service**: User accounts
- **ML Service**: Demand prediction, ETA calculation

### Infrastructure
- **Kubernetes**: Production deployments
- **Docker Compose**: Local development
- **Kafka**: Event streaming between services

## Development Setup


## Docker setup
```text
touch .env (Add the following)
ADMIN_SERVICE_PORT = <Port>
BILLING_SERVICE_PORT = <Port>
CUSTOMER_SERVICE_PORT = <Port>
DRIVER_SERVICE_PORT = <Port>


```bash
# Start all services locally
docker-compose up -d

# Access frontends
http://localhost:3000 (Customer)
http://localhost:3001 (Driver)
http://localhost:3002 (Admin)

# Apply Kubernetes configs
kubectl apply -f k8s/