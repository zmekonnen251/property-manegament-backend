const Expense = require('../models/expenseModel');
const { Op } = require('sequelize');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const getExpenses = factory.getAll(Expense);
const getExpense = factory.getOne(Expense);
const createExpense = factory.createOne(Expense);
const updateExpense = factory.updateOne(Expense);
const deleteExpense = factory.deleteOne(Expense);

const getMonthlyStats = catchAsync(async (req, res, next) => {
	const monthlyExpense = await Expense.findAll({
		where: {
			date: {
				[Op.gte]: new Date(new Date() - 30 * 60 * 60 * 24 * 1000),
			},
		},
	});

	let monthlyTotalExpense = 0;
	monthlyExpense.forEach((expense) => {
		monthlyTotalExpense += expense.amount;
	});
	console.log(monthlyTotalExpense);
	res.status(200).json({
		status: 'success',
		data: {
			monthlyExpense,
			monthlyTotalExpense,
		},
	});
});

module.exports = {
	getExpenses,
	getExpense,
	createExpense,
	updateExpense,
	deleteExpense,
	getMonthlyStats,
};
