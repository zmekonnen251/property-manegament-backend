const express = require('express');
const {
	getRentalRoomReservations,
	createRentalRoomReservation,
	getRentalRoomReservation,
	renewRentalRoomReservation,
	uploadContractImages,
	resizeContractImages,
	deleteRentalRoomReservation,
} = require('../controllers/rentalRoomReservationsController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();
router.use(protect);

router
	.route('/')
	.get(getRentalRoomReservations)
	.post(
		restrictTo('admin', 'receptionist1', 'receptionist2'),
		uploadContractImages,
		resizeContractImages,
		createRentalRoomReservation
	);

router
	.route('/:id')
	.get(getRentalRoomReservation)
	.patch(restrictTo('admin', 'careTaker'), renewRentalRoomReservation)
	.delete(restrictTo('admin'), deleteRentalRoomReservation);

module.exports = router;
