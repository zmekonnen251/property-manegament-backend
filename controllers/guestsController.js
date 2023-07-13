const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = require('../utils/filterObj');
const factory = require('./handlerFactory');
const Guest = require('../models/guestModel');

const getAllGuests = factory.getAll(Guest);
const getGuest = factory.getOne(Guest);

module.exports = {
	getAllGuests,
	getGuest,
};
