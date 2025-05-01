const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Import your Sequelize instance

const Bill = sequelize.define('Bill', {
  _id: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false, // Equivalent to `required: true`
    comment: 'Unique identifier for the bill',
    validate: {
      is: /^\d{3}-\d{2}-\d{4}$/, // SSN format: 123-45-6789
    },
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Date of the bill',
  },
  pickupTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Pickup time',
  },
  dropoffTime: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: 'Dropoff time',
  },
  distanceCovered: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Distance covered in the ride',
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    comment: 'Total amount charged',
  },
  pickupLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Source location of the ride',
  },
  dropoffLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Destination location of the ride',
  },
  driverId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'ID of the driver',
  },
  customerId: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'ID of the customer',
  },
}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  tableName: 'bills', // Name of the table in the database
});

module.exports = Bill;
