module.exports = {
    RIDE_EVENTS: {
      CREATED: 'ride.created',
      UPDATED: 'ride.updated',
      COMPLETED: 'ride.completed',
      CANCELLED: 'ride.cancelled',
      ACCEPTED: 'ride.accepted'
    },
    DRIVER_EVENTS: {
      LOCATION_UPDATED: 'driver.location.updated',
      AVAILABLE: 'driver.available',
      UNAVAILABLE: 'driver.unavailable'
    },
    BILLING_EVENTS: {
      PAYMENT_PROCESSED: 'payment.processed',
      PAYMENT_FAILED: 'payment.failed',
      INVOICE_GENERATED: 'invoice.generated'
    },
    NOTIFICATION_EVENTS: {
      RIDE_ACCEPTED: 'ride.accepted',
      RIDE_COMPLETED: 'ride.completed',
      DRIVER_ARRIVED: 'driver.arrived',
      PAYMENT_RECEIPT: 'payment.receipt'
    }
  };