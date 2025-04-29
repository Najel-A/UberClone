# Current File Structure (for reference)
├── frontend/                      # Tier 1: Frontend (React + Redux, each feature as a microservice)
│   ├── customer-frontend/          # Customer frontend service
│   │   ├── public/                 # Static assets (images, icons)
│   │   ├── src/
│   │   │   ├── components/         # Reusable UI components (Button, RideCard, etc.)
│   │   │   ├── customer/           # Customer-specific features
│   │   │   │   ├── CustomerPage.js # Customer page component
│   │   │   │   ├── customerSlice.js # Redux slice (state, reducers, async thunks)
│   │   │   │   └── customerAPI.js   # API calls for customer data
│   │   │   ├── app/
│   │   │   │   ├── store.js         # Redux store setup
│   │   │   │   └── rootReducer.js   # Combine slices
│   │   │   ├── utils/               # Helper functions (formatting, validation, constants)
│   │   │   ├── App.js               # App routes and layout
│   │   │   └── index.js             # React root entry (ReactDOM.render)
│   │   ├── package.json             # Customer service dependencies
│   │   └── Dockerfile               # Dockerfile for building customer frontend
│   │
│   ├── driver-frontend/             # Driver frontend service
│   │   ├── public/                 
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── driver/             # Driver-specific features
│   │   │   │   ├── DriverPage.js   # Driver page component
│   │   │   │   ├── driverSlice.js  # Redux slice (state, reducers, async thunks)
│   │   │   │   └── driverAPI.js    # API calls for driver data
│   │   │   ├── app/
│   │   │   ├── utils/
│   │   │   ├── App.js              # App routes and layout
│   │   │   └── index.js            # React root entry
│   │   ├── package.json            # Driver service dependencies
│   │   └── Dockerfile              # Dockerfile for building driver frontend
│   │
│   ├── admin-frontend/              # Admin frontend service
│   │   ├── public/                 
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── admin/              # Admin-specific features
│   │   │   │   ├── AdminDashboard.js # Admin dashboard component
│   │   │   │   ├── adminSlice.js    # Redux slice (state, reducers, async thunks)
│   │   │   │   └── adminAPI.js      # API calls for admin data
│   │   │   ├── app/
│   │   │   ├── utils/
│   │   │   ├── App.js              # App routes and layout
│   │   │   └── index.js            # React root entry
│   │   ├── package.json            # Admin service dependencies
│   │   └── Dockerfile              # Dockerfile for building admin frontend
│   │
├── backend/                        # Tier 2: Microservices for backend (API + DB)
│   ├── ride-service/                # Service for managing rides
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── kafka.js        # Kafka client and configs
│   │   │   │   └── db.js           # Database connection
│   │   │   │
│   │   │   ├── kafka/
│   │   │   │   ├── producer/
│   │   │   │   │   └── rideProducer.js  # Kafka Producer for ride events
│   │   │   │   ├── consumer/
│   │   │   │   │   └── rideConsumer.js  # Kafka Consumer to listen to other events
│   │   │   │   └── topics.js       # Topic constants
│   │   │   │
│   │   │   ├── controllers/
│   │   │   │   └── rideController.js  # Express route handlers (API logic)
│   │   │   │
│   │   │   ├── services/
│   │   │   │   └── rideService.js   # Business logic (save ride, assign driver, etc.)
│   │   │   │
│   │   │   ├── models/
│   │   │   │   └── rideModel.js     # Mongoose schema / ORM Model
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   └── rideRoutes.js    # Express routes (HTTP endpoints)
│   │   │   │
│   │   │   ├── app.js               # Express App setup
│   │   │   └── server.js            # Entry point
│   │   │
│   │   ├── package.json
│   │   └── README.md
│   │
│   ├── driver-service/              # Service for managing drivers
│   ├── customer-service/            # Service for managing customers
│   ├── admin-service/               # Service for managing admin tasks
│   └── ml-service/                  # Service for ML predictions│
├── k8s/                             # Kubernetes deployment for all services
│   ├── customer-frontend-deployment.yaml
│   ├── driver-frontend-deployment.yaml
│   ├── admin-frontend-deployment.yaml
│   ├── ride-service-deployment.yaml
│   ├── driver-service-deployment.yaml
│   ├── customer-service-deployment.yaml
│   ├── admin-service-deployment.yaml
│   └── ml-service-deployment.yaml
│
├── docs/                            # Documentation
│
├── docker-compose.yml               # Local dev environment setup for all services
├── .gitignore
└── README.md
