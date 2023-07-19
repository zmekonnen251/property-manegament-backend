const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');

const Room = sequelize.define(
	'Room',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		smoking: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		status: {
			type: Sequelize.ENUM('available', 'unavailable'),
			allowNull: false,
			defaultValue: 'available',
		},
		ready: {
			type: Sequelize.BOOLEAN,
			allowNull: false,
			default: false,
		},
		roomNumber: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
				min: 1,
			},
		},
	},
	{
		individualHooks: true,
	}
);

module.exports = Room;
