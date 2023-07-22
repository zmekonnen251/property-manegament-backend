const Room = require('../models/roomModel');
const RoomType = require('../models/roomTypeModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const Reservation = require('../models/reservationModel');
const Hotel = require('../models/hotelModel');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only images.', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

const uploadRoomTypeImages = upload.fields([
	{ name: 'cover', maxCount: 1 },
	{ name: 'images', maxCount: 10 },
]);

const resizeRoomTypeImages = catchAsync(async (req, res, next) => {
	if (!req.files.cover && !req.files.images) return next();
	const roomTypeName = req.body.name.replace(/\s+/g, '-').toLowerCase();

	// 1) Cover image
	if (req.files.cover) {
		req.body.cover = `uploads/roomTypes/${roomTypeName}-${Date.now()}-cover.jpeg`;

		const result = await sharp(req.files.cover[0].buffer)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(req.body.cover);
	}

	// 2) Images
	if (req.files.images) {
		req.body.images = [];
		await Promise.all(
			req.files.images.map(async (file, i) => {
				const filename = `uploads/roomTypes/${roomTypeName}-${Date.now()}-image-${i}.jpeg`;

				req.body.images.push(filename);
				await sharp(file.buffer)
					.toFormat('jpeg')
					.jpeg({ quality: 90 })
					.toFile(filename);

				// const url = await uploadImage(
				//   `rooms/room-${room.id}`,
				//   roomPageImg,
				//   filename
				// );
			})
		);
	}

	next();
});

// Create getAllRooms function which returns all rooms from the database based on the query parameters
const getAllRooms = factory.getAll(Room, 'RoomType');

const getRoom = factory.getOne(Room, 'Orders,RoomReviews');
const createRoom = catchAsync(async (req, res, next) => {
	const room = Room.create({
		...req.body,
	});

	res.status(201).json({
		status: 'success',
		data: {
			data: room,
		},
	});
});

const updateRoom = factory.updateOne(Room);

const createRoomType = catchAsync(async (req, res, next) => {
	console.log(req.body);
	console.log(req.files);
	const roomType = await RoomType.create({
		...req.body,
	});
	console.log(roomType);
	res.status(201).json({
		status: 'success',
		data: {
			data: roomType.dataValues,
		},
	});
});

const getAllRoomTypes = catchAsync(async (req, res, next) => {
	const roomTypes = await RoomType.findAll({
		include: [
			{
				model: Room,
				attributes: ['id', 'status'],
			},
			{
				model: Hotel,
				attributes: ['id', 'name'],
			},
		],
	});
	console.log(roomTypes);
	res.status(200).json({
		status: 'success',
		results: roomTypes.length,
		data: {
			data: roomTypes,
		},
	});
});

const updateRoomType = factory.updateOne(RoomType);
const deleteRoomType = factory.deleteOne(RoomType);

const getRoomType = catchAsync(async (req, res, next) => {
	const roomType = await RoomType.findByPk(req.params.id);
	const rooms = await roomType.getRooms();
	const hotel = await roomType.getHotel();
	const unavailableRooms = rooms.filter(
		(room) => room.status === 'unavailable'
	);

	const availableRooms = rooms.filter((room) => room.status === 'available');

	roomType.dataValues.rooms = rooms;
	roomType.dataValues.hotel = hotel.dataValues;

	const result = {
		...roomType.dataValues,
		availableRooms,
		numberOfAvailableRooms: availableRooms.length,
		unavailableRooms,
		numberOfUnavailableRooms: unavailableRooms.length,
	};

	res.status(200).json({
		status: 'success',
		data: result,
	});
});

const deleteRoom = factory.deleteOne(Room);

const getRoomTypeReservations = catchAsync(async (req, res, next) => {
	const reservations = await Reservation.findAll();
	const roomTypeRoomsIds = await Room.findAll({
		where: {
			RoomTypeId: req.params.id,
		},
		attributes: ['id'],
	});

	const roomTypeReservations = reservations.filter((reservation) => {
		return reservation.rooms.some((room) =>
			roomTypeRoomsIds.some((roomTypeRoom) => roomTypeRoom.id === room)
		);
	});

	res.status(200).json({
		status: 'success',
		data: {
			roomTypeReservations,
		},
	});
});
module.exports = {
	deleteRoom,
	createRoom,
	createRoomType,
	deleteRoomType,
	updateRoom,
	updateRoomType,
	getRoomType,
	getAllRooms,
	getAllRoomTypes,
	uploadRoomTypeImages,
	resizeRoomTypeImages,
	getRoom,
	getRoomTypeReservations,
};
