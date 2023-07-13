const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');

const RoomType = sequelize.define(
	'RoomType',
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
		slug: {
			type: Sequelize.STRING,
		},
		description: {
			type: Sequelize.STRING,
		},
		numberOfBeds: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
				min: 1,
			},
		},
		capacity: {
			type: Sequelize.INTEGER,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
				min: 1,
			},
		},
		currentPrice: {
			type: Sequelize.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		defaultPrice: {
			type: Sequelize.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
	},
	{
		hooks: {
			beforeCreate: (roomType) => {
				roomType.slug = slugify(roomType.name, { lower: true });
			},
			beforeUpdate: (roomType) => {
				roomType.slug = slugify(roomType.name, { lower: true });
			},
		},
		individualHooks: true,
		timestamp: true,
	}
);

module.exports = RoomType;
