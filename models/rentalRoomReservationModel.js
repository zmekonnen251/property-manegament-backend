const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const RentalRoomReservation = sequelize.define(
	'RentalRoomReservation',
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
		status: {
			type: Sequelize.ENUM('active', 'inactive'),
			allowNull: false,
			defaultValue: 'active',
		},
		assignedTo: {
			type: Sequelize.INTEGER,
		},
		contract: {
			type: Sequelize.ARRAY(Sequelize.STRING),
		},
	},
	{
		timestamps: true,
	}
);

module.exports = RentalRoomReservation;
