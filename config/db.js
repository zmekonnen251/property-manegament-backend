const Sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASS,
	{
		dialect: 'postgres',
		host: process.env.DB_HOST,
		port: process.env.DB_PORT,
		omitNull: true,
		logging: false,
		// dialectOptions: {
		//   ssl: {
		//     require: true,
		//     rejectUnauthorized: false,
		//   },
		// },
	}
);

module.exports = sequelize;
