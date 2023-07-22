const express = require('express');
const {
	createRentalRoom,
	getAllRentalRooms,
	getRentalRoom,
	updateRentalRoom,
	deleteRentalRoom,
} = require('../controllers/rentalRoomsController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(getAllRentalRooms)
	.post(protect, restrictTo('admin'), createRentalRoom);

router
	.route('/:id')
	.get(getRentalRoom)
	.patch(protect, restrictTo('admin'), updateRentalRoom)
	.delete(protect, restrictTo('admin'), deleteRentalRoom);

// router.route('/:id/reservations').get(getRentalRoomReservations);

module.exports = router;
