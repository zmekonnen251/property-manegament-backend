const express = require('express');
const {
	getAllHotels,
	createHotel,
	getHotel,
	updateHotel,
	deleteHotel,
  getHotelRoomTypes,
} = require('../controllers/hotelsController');

const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router
	.route('/')
	.get(getAllHotels)
	.post(protect, restrictTo('admin'), createHotel);

router
	.route('/:id')
	.get(getHotel)
	.patch(protect, restrictTo('admin'), updateHotel)
  .delete(protect, restrictTo('admin'), deleteHotel);
  
router
  .route('/:id/room-types')
  .get(getHotelRoomTypes);



module.exports = router;
