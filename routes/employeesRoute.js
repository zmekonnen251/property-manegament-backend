const express = require('express');
const {
	getAllEmployees,
	getEmployee,
	deleteEmployee,
	updateMe,
	deleteMe,
	updateEmployee,
	createEmployee,
	getMe,
	uploadEmployeePhoto,
	resizeEmployeePhoto,
} = require('../controllers/employeesController');
const {
	login,
	register,
	forgotPassword,
	resetPassword,
	updatePassword,
	protect,
	restrictTo,
	logout,
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.route('/:id').get(getEmployee);

router.delete('/logout', logout);
router.use(protect);

router.get('/me', getMe, getEmployee);
router.patch('/update-my-password', updatePassword);
router.delete('/deleteMe', deleteMe);
router.patch('/updateMe', uploadEmployeePhoto, resizeEmployeePhoto, updateMe);

router.use(restrictTo('admin'));

router.route('/').get(getAllEmployees).post(createEmployee);
router
	.route('/:id')
	.patch(uploadEmployeePhoto, resizeEmployeePhoto, updateEmployee)
	.delete(deleteEmployee);

module.exports = router;
