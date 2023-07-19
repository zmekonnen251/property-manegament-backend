const express = require('express');
const {
	createRoomType,
	getAllRoomTypes,
	getRoomType,
	updateRoomType,
	deleteRoomType,
	getRoomTypeReservations,
	resizeRoomTypeImages,
	uploadRoomTypeImages,
} = require('../controllers/roomsController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(getAllRoomTypes)
	.post(
		protect,
		restrictTo('admin'),
		uploadRoomTypeImages,
		resizeRoomTypeImages,
		createRoomType
	);

router
	.route('/:id')
	.get(getRoomType)
	.patch(
		protect,
		restrictTo('admin'),
		uploadRoomTypeImages,
		resizeRoomTypeImages,
		updateRoomType
	)
	.delete(protect, restrictTo('admin'), deleteRoomType);

router.route('/:id/reservations').get(protect, getRoomTypeReservations);

module.exports = router;
