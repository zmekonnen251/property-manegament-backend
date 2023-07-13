const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define(
	'Reservation',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		dateIn: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		dateOut: {
			type: Sequelize.DATE,
			allowNull: false,
		},
		paidBy: {
			type: Sequelize.ENUM('cash', 'card'),
			allowNull: false,
		},
		paidAmount: {
			type: Sequelize.FLOAT,
			allowNull: false,
		},
		status: {
			type: Sequelize.ENUM('pending', 'checkedIn', 'checkedOut'),
			allowNull: false,
			defaultValue: 'pending',
		},
		rooms: {
			type: Sequelize.ARRAY(Sequelize.INTEGER),
			allowNull: false,
		},
	},
	{
		timestamps: true,
	}
);

module.exports = Reservation;
