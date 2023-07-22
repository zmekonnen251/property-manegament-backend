const { DataTypes } = require('sequelize');
const db = require('../config/db');

const RentalRoom = db.define(
	'RentalRoom',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		roomNumber: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		rentAmount: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM('available', 'unavailable'),
			allowNull: false,
			defaultValue: 'available',
		},
	},
	{
		timestamps: true,
	}
);

module.exports = RentalRoom;
