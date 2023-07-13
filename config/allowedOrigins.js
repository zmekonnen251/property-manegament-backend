const dotenv = require('dotenv');

dotenv.config();

const localhost = [
	'http://localhost:5000',
	'http://localhost:3000',
	'http://localhost:3001',
	'http://localhost:3002',
	'https://checkout.chapa.co',
	'http://192.168.1.100:3000',
	'http://127.0.0.1:5173',
];

const production = [process.env.CLIENT_URL, 'https://checkout.chapa.co'];

const allowedOrigins = [];

if (process.env.NODE_ENV === 'production') {
	allowedOrigins.push(...production);
}

if (process.env.NODE_ENV === 'development') {
	allowedOrigins.push(...localhost);
}

module.exports = allowedOrigins;
