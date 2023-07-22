const Hotel = require('../models/hotelModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

const createHotel = factory.createOne(Hotel);
const getAllHotels = factory.getAll(Hotel);
const getHotel = factory.getOne(Hotel);
const updateHotel = factory.updateOne(Hotel);
const deleteHotel = factory.deleteOne(Hotel);

const getHotelRoomTypes = catchAsync(async (req, res, next) => {
	const { id } = req.params;
	const hotel = await Hotel.findByPk(id);
	const roomTypes = await hotel.getRoomTypes();
	res.status(200).json({
		status: 'success',
		results: roomTypes?.length,
		data: roomTypes,
	});
});

// const getHotelRooms = catchAsync(async (req, res, next) => {
// 	const { id } = req.params;
// 	const hotel = await Hotel.findByPk(id);
// 	const rooms = await hotel.getRooms();
// 	res.status(200).json({
// 		status: 'success',
// 		results: rooms?.length,
// 		data: rooms,
// 	});
// });

module.exports = {
	createHotel,
	getAllHotels,
	getHotel,
	updateHotel,
	deleteHotel,
	getHotelRoomTypes,
};
