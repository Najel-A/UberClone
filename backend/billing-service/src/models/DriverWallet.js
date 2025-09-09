const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DriverWallet = sequelize.define('DriverWallet', {
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
    comment: 'Driver wallet balance',
  },
}, {
  timestamps: false,
  tableName: 'DriverWallet',
});

module.exports = DriverWallet;
