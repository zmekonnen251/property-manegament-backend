const { DataTypes } = require('sequelize');
const db = require('../config/db');

const RentalReservationReceipt = db.define(
	'RentalReservationReceipt',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},

		totalAmount: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		paymentDate: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		paymentMethod: {
			type: DataTypes.ENUM('cash', 'card'),
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = RentalReservationReceipt;
