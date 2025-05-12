const Bill = require("../models/Bill");
const { Op } = require("sequelize");
const { calculateDistance } = require("../utils/geoUtils");

exports.getDriverRevenuePerDay = async (driverId) => {
  const revenueByDay = await Bill.findAll({
    attributes: [
      [sequelize.fn("DATE", sequelize.col("date")), "day"],
      [sequelize.fn("SUM", sequelize.col("totalAmount")), "totalRevenue"],
    ],
    where: {
      driverId: driverId,
      status: "completed",
    },
    group: [sequelize.fn("DATE", sequelize.col("date"))],
    order: [[sequelize.fn("DATE", sequelize.col("date")), "DESC"]],
  });

  return revenueByDay;
};

exports.getRidesInArea = async (centerLat, centerLng, radiusMiles = 10) => {
  // This is a simplified version - in production you'd want to use proper geospatial queries
  const bills = await Bill.findAll({
    where: {
      status: "completed",
    },
  });

  const ridesInArea = bills.filter((bill) => {
    const pickupDistance = calculateDistance(
      centerLat,
      centerLng,
      bill.pickupLocation.split(",")[0],
      bill.pickupLocation.split(",")[1]
    );
    const dropoffDistance = calculateDistance(
      centerLat,
      centerLng,
      bill.dropoffLocation.split(",")[0],
      bill.dropoffLocation.split(",")[1]
    );

    return pickupDistance <= radiusMiles || dropoffDistance <= radiusMiles;
  });

  return ridesInArea.length;
};
