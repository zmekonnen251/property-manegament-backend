const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const compression = require('compression');

// const corsOptions = require('./config/corsOptions');

const roomsRouter = require('./routes/roomsRoute');
const employeesRouter = require('./routes/employeesRoute');
const guestsRouter = require('./routes/guestsRoute');
const reservationsRouter = require('./routes/reservationsRoute');
const roomTypesRouter = require('./routes/roomTypesRoute');
const expenseRouter = require('./routes/expensesRoute');

const AppError = require('./utils/appError');

const {
	globalErrorHandler,
	unCaughtException,
} = require('./controllers/errorController');

const path = require('path');
const { fileURLToPath } = require('url');

unCaughtException();

const app = express();

app.enable('trust proxy');
// 1) GLOBAL MIDDLEWARES

app.use(cors('*'));
// app.options('*', cors());

// serving static files
app.use(express.static(path.join(__dirname, 'public')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Set security HTTP headers

// Development logging
if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
}

// Body parser, reading data = require( body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

app.use(compression());

// Test middleware
app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// 3) ROUTES
app.use('/api/rooms', roomsRouter);
app.use('/api/room-types', roomTypesRouter);
app.use('/api/employees', employeesRouter);
app.use('/api/reservations', reservationsRouter);
app.use('/api/guests', guestsRouter);
app.use('/api/expenses', expenseRouter);

//For the unhadled routes send the build react app
app.use(express.static('../kube-comic-book-client/build'));

app.get('/test', (req, res) => {
	res.send('Hello from the server');
});

//5) Global error handler
app.use(globalErrorHandler);

module.exports = app;
