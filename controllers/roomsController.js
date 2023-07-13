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

const uploadRoomPageImages = upload.fields([
	{ name: 'coverPage', maxCount: 1 },
	{ name: 'pageImages', maxCount: 100 },
]);

const resizeRoomPageImages = catchAsync(async (req, res, next) => {
	if (!req.files.coverPageImage && !req.files.pageImages) return next();

	const room = await Room.findByPk(req.params.id);

	// 1) Cover image
	if (req.files.coverPage) {
		req.body.coverPage = `room-${room.id}-cover.jpeg`;

		if (!fs.existsSync(`uploads/rooms/room-${room.id}`)) {
			fs.mkdirSync(`uploads/rooms/room-${room.id}`, {
				recursive: true,
			});
		}

		if (
			fs.existsSync(`uploads/rooms/room-${room.id}/room-${room.id}-cover.jpeg`)
		) {
			fs.unlinkSync(`uploads/rooms/room-${room.id}/room-${room.id}-cover.jpeg`);
		}

		const covePageImage = await sharp(req.files.coverPage[0].buffer)
			.toFormat('jpeg')
			.jpeg({ quality: 90 })
			.toFile(`uploads/rooms/room-${room.id}/room-${room.id}-cover.jpeg`);

		// const url = await uploadImage(
		//   `rooms/room-${room.id}`,
		//   covePageImage,
		//   req.body.coverPage
		// );
	}

	// 2) pages
	if (req.files.pageImages) {
		if (!fs.existsSync(`uploads/rooms/room-${room.id}`)) {
			fs.mkdirSync(`uploads/rooms/room-${room.id}`, {
				recursive: true,
			});
		}

		await Promise.all(
			req.files.pageImages.map(async (file, i) => {
				const filename = req.files.pageImages[i]['originalname'];

				if (fs.existsSync(`uploads/rooms/room-${room.id}/${filename}`)) {
					fs.unlinkSync(`uploads/rooms/room-${room.id}/${filename}`);
				}

				const roomPageImg = await sharp(file.buffer)
					.toFormat('jpeg')
					.jpeg({ quality: 90 })
					.toFile(`uploads/rooms/room-${room.id}/${filename}`);

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
// const getRoomType = factory.getOne(RoomType, 'Rooms');
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
	uploadRoomPageImages,
	resizeRoomPageImages,
	getRoom,
};
