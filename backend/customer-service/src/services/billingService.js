exports.generateBill = (customer, ride) => {
    // Simple flat rate example
    const baseFare = 5;
    const perMile = 2.5;
    const total = baseFare + (ride.distance * perMile);
  
    return {
      customerId: customer._id,
      rideId: ride.id,
      amount: total.toFixed(2),
      date: new Date()
    };
  };
  