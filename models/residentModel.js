const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Resident = sequelize.define(
	'Resident',
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
		idNumber: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		idType: {
			type: Sequelize.ENUM('passport', 'idCard'),
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

module.exports = Resident;
