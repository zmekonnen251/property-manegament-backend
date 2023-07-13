const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const slugify = require('slugify');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const Employee = sequelize.define(
	'Employee',
	{
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			allowNull: false,
			unique: true,
			primaryKey: true,
		},
		firstName: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		lastName: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		idNumber: {
			type: Sequelize.STRING,
			unique: true,
		},
		email: {
			type: Sequelize.STRING,
			unique: true,
			validate: {
				isEmail: true,
			},
		},
		phone: {
			type: Sequelize.STRING,
			allowNull: false,
			unique: true,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		salary: {
			type: Sequelize.FLOAT,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		dateOfBirth: {
			type: Sequelize.DATEONLY,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		hiredAt: {
			type: Sequelize.DATEONLY,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
			},
		},
		photo: {
			type: Sequelize.STRING,
			defaultValue: 'uploads/users/img/default.jpg',
		},
		role: {
			type: Sequelize.ENUM(
				'admin',
				'manager',
				'receptionist',

				'cleaner',
				'chef',
				'waiter',
				'accountant',
				'security',
				'driver',
				'bellboy',
				'porter',
				'concierge',
				'housekeeper',
				'laundry',
				'maintenance',
				'gardener',
				'technician',
				'other'
			),
			defaultValue: 'other',
		},
		password: {
			type: Sequelize.STRING,
			allowNull: false,
			validate: {
				notEmpty: true,
				notNull: true,
				len: [8, undefined],
			},
			set(val) {
				const salt = bcrypt.genSaltSync(12);
				const hash = bcrypt.hashSync(val, salt);
				this.setDataValue('password', hash);
			},
		},
		passwordChangedAt: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		passwordResetToken: {
			type: Sequelize.STRING,
			allowNull: true,
		},
		passwordResetExpires: {
			type: Sequelize.DATE,
			allowNull: true,
		},
		active: {
			type: Sequelize.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		timestamps: true,
	}
);

Employee.beforeUpdate(async (user, options) => {
	if (user.changed('password')) {
		const salt = await bcrypt.genSalt(12);
		hashedPassword = await bcrypt.hash(user.password, salt);
		user.password = hashedPassword;
	}
});

Employee.prototype.correctPassword = async function (
	candidatePassword,
	userPassword
) {
	return await bcrypt.compare(candidatePassword, userPassword);
};

Employee.prototype.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(
			this.passwordChangedAt.getTime() / 1000,
			10
		);

		return JWTTimestamp < changedTimestamp;
	}
	return false;
};

Employee.prototype.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto
		.createHash('sha256')
		.update(resetToken)
		.digest('hex');

	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

module.exports = Employee;
