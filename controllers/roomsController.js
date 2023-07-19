const Room = require('../models/roomModel');
const RoomType = require('../models/roomTypeModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');
const getAccessToken = require('../utils/getAccessToken');
const Reservation = require('../models/reservationModel');

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
	const fileName = `roomType-${roomTypeName}-${Date.now()}-cover.jpeg`;
	const cover = `uploads/roomTypes/${fileName}`;
	// 1) Cover image
	if (!fs.existsSync(`uploads/roomTypes`)) {
		fs.mkdirSync(`uploads/roomTypes`, {
			recursive: true,
		});
	}

	if (req.files.cover) {
		req.body.cover = `uploads/roomTypes/${fileName}`;

		await sharp(req.files.cover[0].buffer)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(cover);
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

const createRoomType = factory.createOne(RoomType);
const getAllRoomTypes = factory.getAll(RoomType, 'Rooms');
const updateRoomType = factory.updateOne(RoomType);
const deleteRoomType = factory.deleteOne(RoomType);

const getRoomType = catchAsync(async (req, res, next) => {
	const roomType = await RoomType.findByPk(req.params.id, {
		include: [
			{
				model: Room,
			},
		],
	});

	const unavailableRooms = roomType.Rooms.filter(
		(room) => room.status === 'unavailable'
	);

	const availableRooms = roomType.Rooms.filter(
		(room) => room.status === 'available'
	);

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
