const Employee = require('../models/employeeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');
const getAccessToken = require('../utils/getAccessToken');
const generateJwtToken = require('../utils/generateJwtToken');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only images.', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

const uploadEmployeePhoto = upload.single('photo');

const resizeEmployeePhoto = async (req, res, next) => {
	if (!req.file) return next();

	req.file.filename = `uploads/employees/images/employee-${
		req.employee.id
	}-${Date.now()}.jpeg`;

	await sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(req.file.filename);

	// .toFile(`public/img/employees/${req.file.filename}`);

	next();
};
//Admin can get all employees and can update,delete,get and create employees

const getAllEmployees = factory.getAll(Employee);

const getEmployee = factory.getOne(Employee);
const createEmployee = factory.createOne(Employee);
const updateEmployee = factory.updateOne(Employee);
const deleteEmployee = factory.deleteOne(Employee);

//A employee can update,delete and get his/her profile
const getMe = (req, res, next) => {
	req.params.id = req.employee.id;
	next();
};

const updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if employee POSTs password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword.',
				400
			)
		);
	}

	// 2) Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');

	if (req.file) filteredBody.photo = req.file.filename;

	// 3) Update employee document
	const updatedEmployee = await req.employee.update(filteredBody);
	const accessToken = generateJwtToken('access', updatedEmployee);

	res.status(200).json({
		status: 'success',
		accessToken,
	});
});

const deleteMe = catchAsync(async (req, res, next) => {
	const employee = Employee.findByPk(req.employee.id);
	if (!employee.active)
		return next(new AppError('Employee already deleted', 404));

	await Employee.update({ active: false }, { where: { id: req.employee.id } });

	res.status(204).json({
		status: 'success',
		data: null,
		accessToken: null,
	});
});

module.exports = {
	resizeEmployeePhoto,
	updateEmployee,
	deleteMe,
	updateMe,
	getAllEmployees,
	getEmployee,
	uploadEmployeePhoto,
	getMe,
	deleteEmployee,
	createEmployee,
};
