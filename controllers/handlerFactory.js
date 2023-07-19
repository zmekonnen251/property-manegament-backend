const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const apiFeatures = require('./../utils/apiFeatures');
const sequelize = require('../config/db');
const { Op } = require('sequelize');
const getAccessToken = require('../utils/getAccessToken');

const deleteOne = (Model) =>
	catchAsync(async (req, res, next) => {
		const doc = await Model.destroy({
			where: { id: req.params.id },
		});

		if (!doc) return next(new AppError('No document found with that Id', 404));
		res.status(204).json({
			status: 'success',
			data: null,
			accessToken: getAccessToken(req),
		});
	});

const updateOne = (Model, filter) =>
	catchAsync(async (req, res, next) => {
		const filteredBody = filter ? filterObj(req.body, ...filter) : req.body;
		const data = await Model.update(
			{
				...filteredBody,
			},
			{
				where: { id: req.params.id },
			}
		);
		const doc = await Model.findByPk(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		res.status(200).json({
			status: 'success',
			data: doc.dataValues,
		});
	});

const createOne = (Model, filter) =>
	catchAsync(async (req, res, next) => {
		const filteredBody = filter ? filterObj(req.body, ...filter) : req.body;

		if (Model.name === 'Employee') {
			filteredBody.passwordChangedAt = Date.now() - 1000;
		}

		const doc = await Model.create(filteredBody);

		if (Model.name === 'Employee') {
			doc.password = undefined;
			doc.passwordChangedAt = undefined;
		}

		res.status(201).json({
			status: 'success',
			data: doc,
		});
	});

const getOne = (Model, populateOptions) =>
	catchAsync(async (req, res, next) => {
		let includes = {};
		if (populateOptions) {
			includes = { include: populateOptions.split(',') };
		}
		const doc = populateOptions
			? await Model.findByPk(req.params.id, includes)
			: await Model.findByPk(req.params.id);

		if (!doc) {
			return next(new AppError('No document found with that ID', 404));
		}

		if (Model.name === 'User' && doc.role === 'admin') {
			doc.email = undefined;
		}

		res.status(200).json({
			status: 'success',
			data: doc,
		});
	});

const getAll = (Model, populateOptions) =>
	catchAsync(async (req, res, next) => {
		// Prepare query object
		let includes = [];
		if (populateOptions) {
			includes = populateOptions.split(',');
		}

		const queryObj = apiFeatures(req.query);
		queryObj.includes = includes;

		const total = await Model.count();
		const doc = await Model.findAll(queryObj);

		//SEND RESPONSE
		res.status(200).json({
			status: 'success',
			total,
			perPage: queryObj.limit,
			data: doc,
		});
	});

module.exports = {
	createOne,
	deleteOne,
	getAll,
	getOne,
	updateOne,
};
