const fs = require('fs');
const multer = require('multer');
const sharp = require('sharp');
const RentalRoomReservation = require('../models/rentalRoomReservationModel');
const RentalReservationReceipt = require('../models/rentalReservationReceiptModel');
const Resident = require('../models/residentModel');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const RentalRoom = require('../models/rentalRoomModel');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only Images.', 400), false);
	}
};

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter,
});

const uploadContractImages = upload.fields([
	{ name: 'contract', maxCount: 10 },
]);

const resizeContractImages = catchAsync(async (req, res, next) => {
	if (!req.files.contract) return next();

	// 2) Images
	if (!fs.existsSync('uploads/contracts')) {
		fs.mkdirSync('uploads/contracts');
	}
	if (req.files.contract) {
		req.body.contract = [];
		await Promise.all(
			req.files.contract.map(async (file, i) => {
				const filename = `uploads/contracts/${req.body.firstName}-${
					req.body.lastName
				}-${Date.now()}-image-${i}.jpeg`;

				req.body.contract.push(filename);
				await sharp(file.buffer)
					.toFormat('jpeg')
					.jpeg({ quality: 90 })
					.toFile(filename);

				// const url = await uploadImage(
				//   `rooms/room-${room.id}`,
				//   roomPageImg,
				//   filename
				// );
			})
		);
	}

	next();
});
const createRentalRoomReservation = catchAsync(async (req, res, next) => {
	const {
		dateIn,
		dateOut,
		firstName,
		lastName,
		phone,
		email,
		idNumber,
		idType,
		roomId,
		contract,
		assignedTo,
		paymentMethod,
		paidAmount: totalAmount,
	} = req.body;

	const roomNumber = await RentalRoom.findByPk(roomId);

	const newResident = await Resident.create({
		firstName,
		lastName,
		phone,
		email,
		idNumber,
		idType,
	});

	const newRentalRoomReservation = await RentalRoomReservation.create({
		dateIn,
		dateOut,
		roomNumber,
		contract,
		assignedTo,
		RentalRoomId: roomId,
		ResidentId: newResident.id,
	});

	const newRentalReservationReceipt = await RentalReservationReceipt.create({
		paymentMethod,
		totalAmount,
		paymentDate: Date.now(),
		ResidentId: newResident.id,
		RentalRoomReservationId: newRentalRoomReservation.id,
	});

	// Attach RentalRoom and Resident to the newRentalRoomReservation
	newRentalRoomReservation.dataValues.RentalRoom =
		await newRentalRoomReservation.getRentalRoom().dataValues;
	newRentalRoomReservation.dataValues.Resident = newResident.dataValues;
	newRentalRoomReservation.dataValues.RentalReservationReceipt =
		newRentalReservationReceipt.dataValues;

	const reservation = {
		...newRentalRoomReservation.dataValues,
	};
	console.log(reservation);
	console.log(newResident.email);
	await new Email().sendRentalRoomReservationConfirmation(
		newResident.email,
		reservation
	);

	res.status(201).json({
		status: 'success',
		data: newRentalRoomReservation,
	});
});

const getRentalRoomReservations = catchAsync(async (req, res, next) => {
	const rentalRoomReservations = await RentalRoomReservation.findAll({
		include: [Resident, RentalReservationReceipt, RentalRoom],
	});

	res.status(200).json({
		status: 'success',
		data: rentalRoomReservations,
	});
});

const getRentalRoomReservation = catchAsync(async (req, res, next) => {
	const rentalRoomReservation = await RentalRoomReservation.findOne({
		where: {
			id: req.params.id,
		},
		include: [Resident, RentalReservationReceipt, RentalRoom],
	});
	res.status(200).json({
		status: 'success',
		data: rentalRoomReservation.dataValues,
	});
});

const renewRentalRoomReservation = catchAsync(async (req, res, next) => {
	const { dateOut, paidBy, paidAmount } = req.body;

	const rentalRoomReservation = await RentalRoomReservation.findByPk(
		req.params.id
	);

	const newDateOut = new Date(rentalRoomReservation.dateOut);
	newDateOut.setMonth(newDateOut.getMonth() + 1);

	rentalRoomReservation.update({
		dateOut: newDateOut,
	});

	const newRentalReservationReceipt = await RentalReservationReceipt.create({
		paidBy,
		paidAmount,
		paymentDate: Date.now(),
		RentalRoomReservationId: rentalRoomReservation.id,
	});

	await new Email().sendReservationConfirmation(
		rentalRoomReservation,
		rentalRoomReservation.Resident.email
	);

	rentalRoomReservation.dataValues.RentalReservationReceipt =
		newRentalReservationReceipt.dataValues;
	rentalRoomReservation.dataValues.Resident =
		rentalRoomReservation.Resident.dataValues;

	res.status(200).json({
		status: 'success',
		data: rentalRoomReservation,
	});
});

// Update the status of rental room reservation by checking if the dateOut is passed
// Check all the active rental room reservations and update their status

const updateRentalRoomReserationStatus = async () => {
	const rentalRoomReservations = await RentalRoomReservation.findAll({
		where: {
			status: 'active',
		},
	});

	rentalRoomReservations.forEach(async (rentalRoomReservation) => {
		const dateOut = new Date(rentalRoomReservation.dateOut);
		const today = new Date();

		if (dateOut < today) {
			await rentalRoomReservation.update({
				status: 'inactive',
			});

			await rentalRoomReservation.save();
		}
	});
};

const deleteRentalRoomReservation = factory.deleteOne(RentalRoomReservation);

module.exports = {
	createRentalRoomReservation,
	getRentalRoomReservations,
	getRentalRoomReservation,
	renewRentalRoomReservation,
	updateRentalRoomReserationStatus,
	uploadContractImages,
	resizeContractImages,
	deleteRentalRoomReservation,
};
