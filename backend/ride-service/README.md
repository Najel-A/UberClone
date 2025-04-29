```text
ride-service/
├── src/
│   ├── config/
│   │   ├── kafka.js               # Kafka brokers, client IDs
│   │   ├── redis.js               # Geospatial cache config
│   │   ├── db.js                  # MongoDB/Postgres connection
│   │   └── env.js                 # Environment variables
│   │
│   ├── events/
│   │   ├── producers/
│   │   │   ├── RideProducer.js    # ride.created, ride.updated, ride.completed
│   │   │   └── LocationProducer.js # driver.location.updated
│   │   ├── consumers/
│   │   │   ├── BillingConsumer.js # billing.payment_processed
│   │   │   └── NotificationConsumer.js
│   │   └── eventTypes.js          # All event schemas
│   │
│   ├── routes/
│   │   ├── rideRoutes.js          # /rides endpoints
│   │   ├── driverRoutes.js        # /drivers endpoints
│   │   └── customerRoutes.js      # /customers endpoints
│   │
│   ├── controllers/
│   │   ├── rideController.js      # All /rides logic
│   │   ├── driverController.js    # Nearby drivers logic
│   │   └── statsController.js     # Statistics aggregation
│   │
│   ├── services/
│   │   ├── RideService.js         # Core ride operations
│   │   ├── LocationService.js     # Geospatial calculations
│   │   └── PricingService.js      # Dynamic pricing
│   │
│   ├── models/
│   │   ├── Ride.js                # Ride schema
│   │   ├── Driver.js              # Driver schema (location embedded)
│   │   └── Customer.js
│   │
│   ├── utils/
│   │   ├── geoUtils.js            # Haversine calculations
│   │   ├── circuitBreaker.js      # Circuit breaker for ML
│   │   └── logger.js              # Logging for debugging
│   │
│   ├── app.js                     # Middleware setup
|
├── server.js                 # Kafka consumers initialization
│
│
└── package.json
```