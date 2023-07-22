const dotenv = require('dotenv');
const sequelize = require('./config/db');
const schedule = require('node-schedule');

const Room = require('./models/roomModel');
const Employee = require('./models/employeeModel');
const Guest = require('./models/guestModel');
const RoomType = require('./models/roomTypeModel');
const Reservation = require('./models/reservationModel');
const Hotel = require('./models/hotelModel');
const RentalRoom = require('./models/rentalRoomModel');
const RentalRoomReservation = require('./models/rentalRoomReservationModel');
const RentalReservationReceipt = require('./models/rentalReservationReceiptModel');
const Resident = require('./models/residentModel');
const {
	updateRentalRoomReserationStatus,
} = require('./controllers/rentalRoomReservationsController');
const {
	checkoutExpiredReservation,
} = require('./controllers/reservationsController');

const {
	unHandledRejection,
	unCaughtException,
} = require('./controllers/errorController');

dotenv.config();

unCaughtException();

const app = require('./app');

// sequelize
Guest.hasMany(Reservation, {
	constraints: true,
	onDelete: 'CASCADE',
});

Reservation.belongsTo(Guest, {
	constraints: true,
	onDelete: 'CASCADE',
});

RoomType.hasMany(Room, {
	constraints: true,
	onDelete: 'CASCADE',
});

Room.belongsTo(RoomType, {
	constraints: true,
	onDelete: 'CASCADE',
});

Employee.hasMany(Reservation, {
	constraints: true,
	onDelete: 'CASCADE',
});

Reservation.belongsTo(Employee, {
	constraints: true,
	onDelete: 'CASCADE',
});

Hotel.hasMany(RoomType, {
	constraints: true,
	onDelete: 'CASCADE',
});

RoomType.belongsTo(Hotel, {
	constraints: true,
	onDelete: 'CASCADE',
});

Hotel.hasMany(RentalRoom, {
	constraints: true,
	onDelete: 'CASCADE',
});

RentalRoom.belongsTo(Hotel, {
	constraints: true,
	onDelete: 'CASCADE',
});

Resident.hasMany(RentalRoomReservation, {
	constraints: true,
	onDelete: 'CASCADE',
});

RentalRoomReservation.belongsTo(Resident, {
	constraints: true,
	onDelete: 'CASCADE',
});

RentalRoom.hasMany(RentalRoomReservation, {
	constraints: true,
	onDelete: 'CASCADE',
});
RentalRoomReservation.belongsTo(RentalRoom);

Employee.hasMany(RentalRoomReservation, {
	constraints: true,
	onDelete: 'CASCADE',
});

RentalRoomReservation.belongsTo(Employee);

RentalRoomReservation.hasMany(RentalReservationReceipt);
RentalReservationReceipt.belongsTo(RentalRoomReservation);

Resident.hasMany(RentalReservationReceipt);
RentalReservationReceipt.belongsTo(Resident);

sequelize
	.sync({ force: true })
	.then(() => {
		Employee.create({
			firstName: 'Admin',
			lastName: 'Admin',
			email: 'admin@email.com',
			password: '1234abcd',
			salary: 10000,
			dateOfBirth: '1998-01-01',
			phone: '0912345678',
			role: 'admin',
			hiredAt: '2021-01-01',
		});
		console.log('DB connection successful!');
	})
	.catch((err) => {
		console.log('DB connection failed!');
	});

const port = process.env.PORT || 5000;

const server = app.listen(port, () => {
	console.log(`App listening on port ${port}!`);

	schedule.scheduleJob('*/1 * * * *', async () => {
		await checkoutExpiredReservation();
		await updateRentalRoomReserationStatus();
		// console.log('running a task every minute');
	});
});

unHandledRejection(server);
