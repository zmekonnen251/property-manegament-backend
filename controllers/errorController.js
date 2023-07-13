const dotenv = require('dotenv');
const AppError = require('../utils/appError.js');

dotenv.config();

const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}.`;
	return new AppError(err.message, 400);
};

const handleDuplicateFieldsDB = (err) => {
	const errors = err.errors.map(
		(el) => `Duplicate ${el.path}: ${el.value}. Please use another value!`
	);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => el.message);
	const message = `Invalid input data. ${errors.join('. ')}`;
	return new AppError(message, 400);
};

const handleJWTError = () =>
	new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
	new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
	});

	// Operational, trusted error: send message to client
};

const sendErrorProd = (err, req, res) => {
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
		});

		// Programming or other unknown error: don't leak error details
	} else {
		// 1) Log error
		console.error('ERROR 🤣', err);

		// 2) Send generic message
		res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
	}
};

const globalErrorHandler = (err, req, res, next) => {
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';
	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, req, res);
	} else if (process.env.NODE_ENV === 'production') {
		let error = { ...err };
		error.name = err.name;
		error.message = err.message;

		if (error.name === 'SequelizeDatabaseError')
			error = handleCastErrorDB(error);
		if (error.name === 'SequelizeUniqueConstraintError')
			error = handleDuplicateFieldsDB(error);
		if (error.name === 'SequelizeValidationError')
			error = handleValidationErrorDB(error);
		if (error.name === 'JsonWebTokenError') error = handleJWTError();
		if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

		sendErrorProd(error, req, res);
	}
};

const unCaughtException = () =>
	process.on('uncaughtException', (err) => {
		console.log(err.name, err.message);
		console.log(err);

		console.log('UNCAUGHT EXCEPTION! 🗣 Shutting down...');
		process.exit(1);
	});

const unHandledRejection = (server) =>
	process.on('unhandledRejection', (err) => {
		console.log(err.name, err.message);
		console.log(err);

		console.log('UNHANDLED REJECTION! 🗣 Shutting down...');
		server.close(() => {
			process.exit(1);
		});
	});

module.exports = {
	globalErrorHandler,
	unCaughtException,
	unHandledRejection,
};
