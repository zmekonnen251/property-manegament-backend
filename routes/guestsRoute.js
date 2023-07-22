const express = require('express');

const router = express.Router();

const {
	getAllGuests,
	getGuest,
	deleteGuest,
} = require('../controllers/guestsController');

router.route('/').get(getAllGuests);
router.route('/:id').get(getGuest).delete(deleteGuest);

module.exports = router;
