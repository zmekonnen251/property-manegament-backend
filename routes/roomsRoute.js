const express = require('express');
const {
	getAllRooms,
	createRoom,
	getRoom,
	updateRoom,
	deleteRoom,
	uploadRoomPageImages,
	resizeRoomPageImages,
	createRoomType,
	getAllRoomTypes,
	getRoomType,
	updateRoomType,
	deleteRoomType,
} = require('../controllers/roomsController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(getAllRooms)
	.post(protect, restrictTo('admin'), createRoom);

router
	.route('/:id')
	.get(getRoom)
	.patch(protect, restrictTo('admin'), updateRoom)
	.delete(protect, restrictTo('admin'), deleteRoom);

module.exports = router;
