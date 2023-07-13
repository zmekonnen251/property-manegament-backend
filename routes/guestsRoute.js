const express = require('express');

const router = express.Router();

const { getAllGuests, getGuest } = require('../controllers/guestsController');

router.route('/').get(getAllGuests);
router.route('/:id').get(getGuest);

module.exports = router;
