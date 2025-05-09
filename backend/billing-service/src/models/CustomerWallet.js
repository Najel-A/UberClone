const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CustomerWallet = sequelize.define('CustomerWallet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    comment: 'SQL Primary Key',
  },
  ssn: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'SSN used as ID in MongoDB',
  },
  wallet: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    comment: 'Customer wallet balance',
  },
}, {
  timestamps: false,
  tableName: 'CustomerWallet',
});

module.exports = CustomerWallet;
