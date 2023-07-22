const express = require('express');
const {
	getExpenses,
	getExpense,
	deleteExpense,
	updateExpense,
	createExpense,
	getMonthlyStats,
} = require('../controllers/expensesController');
const { protect, restrictTo } = require('../controllers/authController');

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.route('/monthly-stats').get(getMonthlyStats);
router.route('/').get(getExpenses).post(createExpense);
router.route('/:id').get(getExpense).patch(updateExpense).delete(deleteExpense);

module.exports = router;
