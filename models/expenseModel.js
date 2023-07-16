const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Expense = sequelize.define(
	'Expense',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			unique: true,
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
		reason: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		amount: {
			type: Sequelize.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		date: {
			type: Sequelize.DATE,
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

module.exports = Expense;
