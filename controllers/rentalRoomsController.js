const RentalRoom = require('../models/rentalRoomModel');
const RentalRoomReservation = require('../models/rentalRoomReservationModel');
const Hotel = require('../models/hotelModel');

const catchAsync = require('../utils/catchAsync');

const createRentalRoom = catchAsync(async (req, res, next) => {
	const { name, description, rentAmount, hotelId, roomNumber } = req.body;
	const hotel = await Hotel.findByPk(hotelId);
	const rentalRoom = await RentalRoom.create({
		name,
		description,
		rentAmount,
		roomNumber,
		HotelId: hotel.id,
	});
	res.status(201).json({
		status: 'success',
		data: rentalRoom,
	});
});

const getAllRentalRooms = catchAsync(async (req, res, next) => {
	const rentalRooms = await RentalRoom.findAll();

	let availableRentalRooms = [];

	rentalRooms.forEach(async (rentalRoom) => {
		if (rentalRoom.status === 'available') {
			availableRentalRooms.push(rentalRoom);
		}
	});

	res.status(200).json({
		status: 'success',
		results: rentalRooms?.length,
		data: {
			availableRentalRooms,
			rentalRooms,
		},
	});
});

const getRentalRoom = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const rentalRoom = await RentalRoom.findByPk(id);
	res.status(200).json({
		status: 'success',
		data: rentalRoom,
	});
});

const updateRentalRoom = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const { name, description, price } = req.body;
	const rentalRoom = await RentalRoom.update(
		{
			name,
			description,
			price,
		},
		{ where: { id } }
	);
	res.status(200).json({
		status: 'success',
		data: rentalRoom,
	});
});

const deleteRentalRoom = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const rentalRoom = await RentalRoom.destroy({ where: { id } });
	res.status(204).json({
		status: 'success',
		data: null,
	});
});

const getRentalRoomReservations = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const rentalRoom = await RentalRoom.findByPk(id);
	const rentalRoomReservations = await rentalRoom.getRentalRoomReservations();
	res.status(200).json({
		status: 'success',
		results: rentalRoomReservations?.length,
		data: rentalRoomReservations,
	});
});

module.exports = {
	createRentalRoom,
	getAllRentalRooms,
	getRentalRoom,
	updateRentalRoom,
	deleteRentalRoom,
	getRentalRoomReservations,
};
