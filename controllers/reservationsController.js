const Room = require('../models/roomModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const AppError = require('../utils/appError');
const dotenv = require('dotenv');
const Reservation = require('../models/reservationModel');
const Employee = require('../models/employeeModel');
const Guest = require('../models/guestModel');
const { Op } = require('sequelize');
const RoomType = require('../models/roomTypeModel');
const Email = require('../utils/email');
dotenv.config();

const getEmployeeReservations = catchAsync(async (req, res, next) => {
	//get all reservations of a user and include the room then change the response to JSON
	const reservations = await req.user.getReservations({ include: [Room] });

	res.status(200).json({
		status: 'success',
		results: reservations?.length,
		data: {
			reservations,
		},
	});
});

const getGuestReservations = catchAsync(async (req, res, next) => {
	//get all reservations of a employee and include the room then change the response to JSON
	const reservations = await req.guest.getReservations({ include: [Room] });

	res.status(200).json({
		status: 'success',
		results: reservations?.length,
		data: {
			reservations,
		},
	});
});

const getAllReservations = catchAsync(async (req, res, next) => {
	const reservations = await Reservation.findAll({
		include: [Guest, Employee],
	});

	const rooms = await Room.findAll({
		where: {
			id: { [Op.in]: reservations.map((reservation) => reservation.rooms) },
		},
		include: [RoomType],
	});

	reservations.forEach((reservation) => {
		reservation.dataValues.rooms = rooms.filter((room) =>
			reservation.rooms.includes(room.id)
		);
	});

	res.status(200).json({
		status: 'success',
		results: reservations?.length,
		data: reservations,
	});
});

const deleteReservation = factory.deleteOne(Reservation);
const getReservation = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const reservation = await Reservation.findOne({
		where: {
			id,
		},
		include: [Guest, Employee],
	});

	const rooms = await Room.findAll({
		where: {
			id: { [Op.in]: reservation?.rooms },
		},
		include: [RoomType],
	});

	const assignedTo = await Employee.findByPk(reservation.assignedTo);

	reservation.dataValues.rooms = rooms;

	res.status(200).json({
		data: reservation,
		status: 'success',
	});
});
const updateReservation = catchAsync(async (req, res, next) => {
	const {
		firstName,
		lastName,
		phone,
		email,
		dateIn,
		dateOut,
		paidBy,
		paidAmount,
		roomId,
	} = req.body;
	const reservation = await Reservation.findByPk(req.params.id);
	const updatedGuest = await Guest.update(
		{ firstName, lastName, phone, email },
		{
			where: {
				id: reservation.GuestId,
			},
		}
	);
	const updatedReservation = await Reservation.update(
		{
			GuestId: updatedGuest.id,
			dateIn: dateIn,
			dateOut: dateOut,
			paidBy,
			paidAmount,
			EmployeeId: req.employee.id,
			status: 'checkedIn',
			rooms: [roomId],
		},
		{
			where: {
				id: req.params.id,
			},
		},
		{
			include: [Employee, Guest],
		}
	);

	if (!(roomId in reservation.rooms)) {
		await Room.update(
			{ status: 'unavailable' },
			{
				where: {
					id: roomId,
				},
			}
		);

		await Room.update(
			{ status: 'available' },
			{
				where: {
					id: reservation.rooms[0],
				},
			}
		);
	}

	res.status(200).json({ status: 'success', data: updatedReservation });
});

const createReservation = catchAsync(async (req, res, next) => {
	let {
		firstName,
		lastName,
		phone,
		email,
		dateIn,
		dateOut,
		paidBy,
		paidAmount,
		roomId,
		assignedTo,
		idNumber,
		idType,
	} = req.body;
	if (req.body.assignedTo === '') {
		assignedTo = null;
	}
	const newGuest = await Guest.create({
		firstName,
		lastName,
		phone,
		email,
		idNumber,
		idType,
	});
	let newReservation;
	if (newGuest) {
		newReservation = await Reservation.create({
			GuestId: newGuest.id,
			dateIn: dateIn,
			dateOut: dateOut,
			paidBy,
			paidAmount,
			EmployeeId: req.employee.id,
			status: 'checkedIn',
			rooms: [parseInt(roomId)],
			assignedTo: assignedTo,
		});

		if (newReservation) {
			await Room.update(
				{ status: 'unavailable' },
				{
					where: {
						id: roomId,
					},
				}
			);
		}
	}

	const room = await Room.findByPk(roomId, { include: [RoomType] });
	const guest = await newReservation.getGuest();
	let assignedEmployee;
	if (assignedTo) assignedEmployee = await Employee.findByPk(assignedTo);
	newReservation.dataValues.Guest = guest.dataValues;
	newReservation.dataValues.rooms = [room];
	if (assignedEmployee)
		newReservation.dataValues.assignedEmployee = assignedEmployee;

	if (!newReservation) {
		return next(new AppError('Something went wrong', 404));
	}
	const reservation = {
		...newReservation.dataValues,
	};
	console.log(reservation);
	await new Email().sendReservationConfirmation(guest.email, reservation);
	res.status(200).json({ status: 'success', data: newReservation });
});

const checkoutExpiredReservation = async () => {
	const rooms = await Room.findAll({ where: { status: 'unavailable' } });
	rooms.forEach(async (room) => {
		const reservation = await Reservation.findOne({
			where: { rooms: { [Op.contains]: [room.id] } },
		});

		if (
			reservation &&
			new Date(reservation.dateOut).getTime() < new Date().getTime()
		) {
			await Reservation.update(
				{ status: 'checkedOut' },
				{
					where: {
						id: reservation.id,
					},
				}
			);
			await Room.update(
				{ status: 'available', ready: false },
				{
					where: {
						id: room.id,
					},
				}
			);
		}
	});
};

const getMonthlyStats = catchAsync(async (req, res, next) => {
	const monthlyReservation = await Reservation.findAll({
		where: {
			createdAt: {
				[Op.gte]: new Date(new Date() - 30 * 60 * 60 * 24 * 1000),
			},
		},
		include: [Guest, Employee],
	});

	// monthly total revenue
	let monthlyRevenue = 0;
	monthlyReservation.forEach((reservation) => {
		monthlyRevenue += reservation.paidAmount;
	});

	const monthlyStats = {
		monthlyReservation: monthlyReservation?.length,
		monthlyRevenue,
		numberOfReservations: monthlyReservation?.length,
	};

	res.status(200).json({
		status: 'success',
		data: {
			monthlyStats,
		},
	});
});

const getLatestReservations = catchAsync(async (req, res, next) => {
	const latestReservations = await Reservation.findAll({
		order: [['createdAt', 'DESC']],
		limit: 5,
		include: [Guest, Employee],
	});

	// add the room to the response

	const rooms = await Room.findAll();

	latestReservations.forEach((reservation) => {
		rooms.forEach((room) => {
			if (reservation.rooms.includes(room.id)) {
				reservation.dataValues.Room = room;
			}

			if (reservation.assignedTo) {
				Employee.findByPk(reservation.assignedTo).then((employee) => {
					reservation.dataValues.assignedEmployee = employee;
				});
			}
		});
	});

	res.status(200).json({
		status: 'success',
		data: {
			latestReservations,
		},
	});
});

module.exports = {
	createReservation,
	deleteReservation,
	getAllReservations,
	getReservation,
	updateReservation,
	getGuestReservations,
	getEmployeeReservations,
	checkoutExpiredReservation,
	getMonthlyStats,
	getLatestReservations,
};
