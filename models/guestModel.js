const Sequelize = require('sequelize');
const sequelize = require('../config/db');


const Guest = sequelize.define(
	'Guest',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		firstName: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		lastName: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		email: {
			type: Sequelize.STRING,
		},
		phone: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
	},
	{
		timestamps: true,
	}
);

module.exports = Guest;
