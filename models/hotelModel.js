const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');

const Hotel = sequelize.define(
	'Hotel',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			primaryKey: true,
		},
		name: {
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

module.exports = Hotel;
