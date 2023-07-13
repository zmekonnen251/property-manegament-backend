const express = require('express');

const { protect, restrictTo } = require('../controllers/authController');
const {
	getAllReservations,
	deleteReservation,
	getReservation,
	updateReservation,
	getEmployeeReservations,
	getGuestReservations,
	createReservation,
	getMonthlyStats,
	getLatestReservations,
} = require('../controllers/reservationsController');

const router = express.Router();

router.route('/').get(getAllReservations).post(protect, createReservation);
router.get('/monthly-stats', protect, restrictTo('admin'), getMonthlyStats);
router.get(
	'/latest-reservations',
	protect,
	restrictTo('admin'),
	getLatestReservations
);
router.get('/employee-reservations', protect, getEmployeeReservations);
router.get('/guest-reservations', protect, getGuestReservations);
router.delete('/:id', protect, restrictTo('admin'), deleteReservation);
router.patch('/:id', protect, restrictTo('admin'), updateReservation);
router.get('/:id', protect, restrictTo('admin'), getReservation);

module.exports = router;
