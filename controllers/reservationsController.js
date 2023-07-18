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
dotenv.config();

//  const chapaCheckout = catchAsync(async (req, res, next) => {
// 	const room = await Room.findByPk(req.params.roomId);
// 	const userReservations = await req.user.getReservations({
// 		where: { RoomId: room.id },
// 	});

// 	if (userReservations.length > 0) {
// 		return next(new AppError('You already bought this room', 400));
// 	}

// 	// chapa redirect you to this url when payment is successful
// 	const TRX_REF = `tx-kubecomics-${Date.now()}-${req.user.id}-${
// 		req.params.roomId
// 	}`;
// 	const RETURN_URL = `${req.get('origin')}/profile/my-rooms?success=true`;
// 	const CALLBACK_URL = `${process.env.BASE_URL}/api/reservations/verify-chapa-payment/${TRX_REF}`;

// 	// form data
// 	const data = {
// 		amount: `${room.price}`,
// 		currency: 'ETB',
// 		email: `${req.user.email}`,
// 		first_name: `${req.user.name.split(' ')[0]}`,
// 		last_name: `${req.user.name.split(' ')[1]}`,
// 		tx_ref: TRX_REF,
// 		callback_url: CALLBACK_URL,
// 		return_url: RETURN_URL,
// 		customizations: {
// 			title: 'Kube Comics Room',
// 			description: `Payment for ${room.title}`,
// 			logo: 'https://kubecomicseth.com/static/media/logo.a5f8aefb44babbcd6e25.png',
// 		},
// 	};

// 	const chapaResponse = await axios.post(CHAPA_URL, data, config);

// 	if (chapaResponse.data.status !== 'success') {
// 		return next(new AppError('Payment failed', 404));
// 	}

// 	res.status(200).json({
// 		status: 'success',
// 		checkout_url: chapaResponse.data.data.checkout_url,
// 	});
// });

//  const verifyChapaPayment = catchAsync(async (req, res, next) => {
// 	try {
// 		const { data } = await axios.get(
// 			`https://api.chapa.co/v1/transaction/verify/${req.params.id}`,
// 			config
// 		);

// 		if (data.status === 'success') {
// 			const userId = req.params.id.split('-')[3];
// 			const roomId = req.params.id.split('-')[4];
// 			const user = await Employee.findByPk(parseInt(userId));

// 			const reservation = await Reservation.create({
// 				paid: true,
// 				RoomId: roomId,
// 				EmployeeId: userId,
// 			});

// 			const transaction = await user.createTransaction({
// 				amount: data.data.amount,
// 				status: 'success',
// 				type: 'payment',
// 				paymentMethod: 'chapa',
// 				paymentId: req.params.id,
// 			});
// 		}
// 		res.status(200).json({ received: true });
// 	} catch (err) {
// 		return next(new AppError('Payment failed', 404));
// 	}
// });

const getEmployeeReservations = catchAsync(async (req, res, next) => {
	//get all reservations of a user and include the room then change the response to JSON
	const reservations = await req.user.getReservations({ include: [Room] });

	res.status(200).json({
		status: 'success',
		results: reservations.length,
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
		results: reservations.length,
		data: {
			reservations,
		},
	});
});

const getAllReservations = factory.getAll(Reservation, 'Room, Employee, Guest');
//  const getMonthlyStats = catchAsync(async (req, res, next) => {
// 	const monthlyReservation = await Reservation.findAll({
// 		where: {
// 			createdAt: {
// 				[Op.gte]: new Date(new Date() - 30 * 60 * 60 * 24 * 1000),
// 			},
// 		},
// 		include: [Room],
// 	});

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
			id: { [Op.in]: reservation.rooms },
		},
		include: [RoomType],
	});

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

	const newGuest = await Guest.create({ firstName, lastName, phone, email });
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
			rooms: [roomId],
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

	if (!newReservation) {
		return next(new AppError('Something went wrong', 404));
	}

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
		monthlyReservation: monthlyReservation.length,
		monthlyRevenue,
		numberOfReservations: monthlyReservation.length,
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
