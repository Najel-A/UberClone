```text
billing-service/
├── src/
│   ├── config/
│   │   ├── kafka.js               # Kafka config
│   │   ├── db.js                  # SQL config
│   │   ├── stripe.js              # Payment gateway (Fake Payment)
│   │   └── env.js
│   │
│   ├── events/
│   │   ├── producers/
│   │   │   ├── BillingProducer.js # bill.created, payment.processed
│   │   │   └── AuditProducer.js   # bill.deleted
│   │   ├── consumers/
│   │   │   └── RideConsumer.js    # ride.completed events
│   │   └── eventTypes.js
│   │
│   ├── routes/
│   │   ├── billRoutes.js          # /bills endpoints
│   │   └── reportRoutes.js        # Stats for Admin Dashboard?
│   │
│   ├── controllers/
│   │   ├── billController.js      # CRUD operations
│   │   └── searchController.js    # Complex bill queries
│   │
│   ├── services/
│   │   ├── BillingService.js      # Core logic
│   │   ├── PaymentService.js      # Fake Payment
│   │   └── ReceiptService.js      # PDF generation
│   │
│   ├── models/
│   │   ├── Bill.js                # Transaction schema
│   │   ├── Invoice.js             # For reporting
│   │   └── AuditLog.js
│   │
│   ├── utils/                     # (Maybe Implement this?)
│   │   ├── currency.js            # Money formatting
│   │   └── idempotency.js         # Payment retry logic
│   │
│   ├── app.js
|
├── server.js                  # Kafka consumers init
│
└── package.json
```