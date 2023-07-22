const crypto = require('crypto');
const jsonWebtoken = require('jsonwebtoken');
const Employee = require('../models/employeeModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const generateJwtToken = require('../utils/generateJwtToken');
const Email = require('../utils/email');
const dotenv = require('dotenv');
const { Op } = require('sequelize');

dotenv.config();
const reservationData = {
	firstName: 'John',
	lastName: 'Doe',
	roomNumber: 101,
	phone: '+251912345678',
	hotelName: 'Hotel Awesome',
	hotelAddress: 'Johansburg, South Africa',
	roomType: 'Deluxe Room',
	dateIn: '2023-07-30',
	dateOut: '2023-08-02',
	roomImage:
		'https://t3.ftcdn.net/jpg/02/71/08/28/360_F_271082810_CtbTjpnOU3vx43ngAKqpCPUBx25udBrg.jpg',
	paidBy: 'cash',
	paidAmount: 1000,
	capacity: 2,
};

const createAndSendCookie = (employee, res, token) => {
	const cookiesOption = {
		httpOnly: true,
		secure: true,
		sameSite: 'None',
		maxAge: new Date(
			Date.now() + process.env.REFRESH_TOKEN_COOKIE_EXPIRES_IN * 60 * 1000
		),
	};
	res.cookie('refreshToken', token, cookiesOption);
};

const register = catchAsync(async (req, res, next) => {
	const {
		firstName,
		lastName,
		dateOfBirth,
		hiredAt,
		idNumber,
		salary,
		photo = 'uploads/employees/images/default.jpg',
		phone,
		email,
		password,
		role = 'other',
	} = req.body;
	const newEmployee = await Employee.create({
		firstName,
		lastName,
		dateOfBirth,
		hiredAt,
		photo,
		phone,
		email,
		password,
		role,
		idNumber,
		salary,
	});

	const accessToken = generateJwtToken('access', newEmployee);

	// const url = `${process.env.CLIENT_URL}/login`;

	// await new Email(newEmployee, url).sendWelcome();

	// createAndSendCookie(newEmployee, res, jwt);
	res.status(201).json({
		accessToken,
		status: 'success',
	});
});

const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	// 1 ) Check if email and password exist
	if (!email || !password)
		return next(new AppError('Please provide email and  password !', 400));

	// 2 ) Check if a Employee exist && password and email are correct
	const employee = await Employee.findOne({ where: { email } });

	if (!employee)
		return next(new AppError('No employee found with this email!', 404));

	if (!(await employee.correctPassword(password, employee.password)))
		return next(new AppError('Incorrect password!', 401));
	// 3 ) If everything correct send token to client


	const accessToken = generateJwtToken('access', employee);

	res.status(201).json({
		accessToken,
		status: 'success',
	});
});

const logout = catchAsync(async (req, res, next) => {
	res.status(200).json({ message: 'success' });
});

// 	if (!cookies?.refreshToken) return res.status(204);

// 	const refreshToken = cookies.refreshToken;

// 	jsonWebtoken.verify(
// 		refreshToken,
// 		process.env.REFRESH_TOKEN_SECRET,

// 		async (err, decodedEmployee) => {
// 			if (err) return next(new AppError('Forbiden!', 403));

// 			const foundEmployee = await Employee.findByPk(decodedEmployee.id);

// 			if (!foundEmployee) return next(new AppError('Forbiden!', 403));

// 			if (foundEmployee.id !== decodedEmployee.id)
// 				return next(new AppError('Forbiden!', 403));

// 			await Employee.update({ jwt: '' }, { where: { id: foundEmployee.id } });

// 			res.clearCookie('refreshToken');

// 			res.status(200).json({ status: 'success' });
// 		}
// 	);
// });

const protect = catchAsync(async (req, res, next) => {
	// 1) Get token
	// const refreshToken = req.cookies['refreshToken'];
	let accessTokenAuthHeader;

	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith('Bearer')
	) {
		accessTokenAuthHeader = req.headers.authorization.split(' ')[1];
	}

	if (!accessTokenAuthHeader) {
		return next(
			new AppError('You are not logged in! Please login to get access.', 401)
		);
	}

	// 2) verify token

	jsonWebtoken.verify(
		accessTokenAuthHeader,
		process.env.ACCESS_TOKEN_SECRET,
		async (err, decodedAccessToken) => {
			if (err) {
				return next(
					new AppError(
						'You are not logged in! Please login to get access.',
						401
					)
				);
			} else {
				const currentEmployee = await Employee.findByPk(decodedAccessToken.id);

				if (!currentEmployee) {
					return next(
						new AppError(
							'The employee belongs to the token does no longer exist.',
							401
						)
					);
				}

				if (currentEmployee.changedPasswordAfter(decodedAccessToken.iat)) {
					return next(
						new AppError(
							'Employee recently changed password! Please login again.',
							401
						)
					);
				}

				req.employee = currentEmployee;

				next();
			}
		}
	);
});

const restrictTo = (...roles) =>
	catchAsync(async (req, res, next) => {
		if (!roles.includes(req.employee.role)) {
			return next(
				new AppError('You do not have permission to perform this action', 403)
			);
		}

		next();
	});

const forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get employee based on posted email
	const employee = await Employee.findOne({
		where: { email: req.body.email },
	});

	if (!employee) {
		return next(new AppError('There is no employee with email address.', 404));
	}

	// 2) Generate the random reset token
	const resetToken = employee.createPasswordResetToken();

	// 3) Send it to employee's email
	const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

	try {
		await new Email(employee, resetURL).sendPasswordReset();

		res.status(200).json({
			status: 'success',
			message: 'Token sent to email!',
		});
	} catch (err) {
		employee.passwordResetToken = undefined;
		employee.passwordResetExpires = undefined;
		await employee.save({ validateBeforeSave: false });

		return next(
			new AppError(
				'There was an error sending the email. Try again later!',
				500
			)
		);
	}
});

const resetPassword = catchAsync(async (req, res, next) => {
	// 1) Get employee based on the token

	const hashedToken = crypto
		.createHash('sha256')
		.update(req.params.token)
		.digest('hex');

	const employee = await Employee.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { [Op.gt]: Date.now() },
	});

	// 2) If token has not expired, and there is employee, set the new password
	if (!employee) {
		return next(new AppError('Token is invalid or has expired', 400));
	}
	employee.password = req.body.password;
	employee.passwordResetToken = undefined;
	employee.passwordResetExpires = undefined;

	// 3) Update changedPasswordAt property for the employee
	// 4) Log the employee in, send JWT
	const accessToken = generateJwtToken('access', employee);

	employee.jwt = refreshToken;

	res.status(200).json({
		accessToken,
	});
});

const updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get employee from collection
	const employee = await Employee.findByPk(req.employee.id);

	// 2) Check if POSTed current password is correct

	if (
		!(await employee.correctPassword(
			req.body.passwordCurrent,
			employee.password
		))
	) {
		return next(new AppError('Your current password is wrong.', 401));
	}

	// 3) If so, update password
	await Employee.update(
		{
			password: req.body.passwordCurrent,
		},
		{ where: { id: req.employee.id } }
	);

	// 4) Log employee in, send JWT
	const accessToken = generateJwtToken('access', employee);

	res.json({ accessToken });
});

module.exports = {
	register,
	login,
	logout,
	protect,
	restrictTo,
	updatePassword,
	resetPassword,
	forgotPassword,
};
