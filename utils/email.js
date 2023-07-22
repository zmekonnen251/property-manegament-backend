const nodemailer = require('nodemailer');
const pug = require('pug');
const { htmlToText } = require('html-to-text');
const dotenv = require('dotenv');
const { fileURLToPath } = require('url');
dotenv.config();

module.exports = class Email {
	constructor() {
		this.from = `<${process.env.DEV_EMAIL_FROM}>`;
	}

	newTransport() {
		if (process.env.NODE_ENV === 'development')
			return nodemailer.createTransport({
				host: process.env.DEV_EMAIL_HOST,
				port: process.env.DEV_EMAIL_PORT,

				auth: {
					user: process.env.DEV_EMAIL_USERNAME,
					pass: process.env.DEV_EMAIL_PASSWORD,
				},
			});
		return nodemailer.createTransport({
			host: process.env.EMAIL_HOST,
			port: process.env.EMAIL_PORT,

			auth: {
				user: process.env.EMAIL_USERNAME,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
	}

	// async send(template, subject) {
	// 	// 1) Render HTML based on a pug template
	// 	let data;
	// 	console.log(this.reservation);
	// 	if (template === 'reservationConfirmation') {
	// 		data = {
	// 			name: 'John Doe',
	// 			hotelName: 'Hotel Awesome',
	// 			roomType: 'Deluxe Room',
	// 			checkInDate: '2023-07-30',
	// 			checkOutDate: '2023-08-02',
	// 			imageUrl: 'https://example.com/room-image.jpg',
	// 		};
	// 	}

	// 	if (template === 'welcome') {
	// 		data = {
	// 			name: this.name,
	// 			url: this.url,
	// 		};
	// 	}

	// 	const html = pug.renderFile(
	// 		`${__dirname}/../views/email/email2/${template}.pug`,
	// 		{
	// 			firstName: this.name,
	// 			url: this.url,
	// 			subject,
	// 		}
	// 	);

	// 	// 2) Define email options
	// 	const mailOptions = {
	// 		from: this.from,
	// 		to: this.to,
	// 		subject,
	// 		html,
	// 		text: htmlToText(html),
	// 	};

	// 	// 3) Create a transport and send email
	// 	await this.newTransport().sendMail(mailOptions);
	// }

	async sendTest() {
		try {
			await this.send('index', 'Hey There welcome to our hotel!');
		} catch (err) {
			console.log(err);
		}
	}

	async sendReservationConfirmation(email, reservation) {
		console.log(reservation);
		const html = pug.renderFile(
			`${__dirname}/../views/email/reservationConfirmation.pug`,
			{
				firstName: reservation.Guest.firstName,
				lastName: reservation.Guest.lastName,
				hotelName: 'Hotel Awesome',
				roomType: reservation.rooms[0].RoomType.name,
				roomNumber: reservation.rooms[0].roomNumber,
				phone: reservation.Guest.phone,
				paidBy: reservation.paidBy,
				paidAmount: reservation.paidAmount,
				dateIn: reservation.dateIn,
				dateOut: reservation.dateOut,
				roomImage: `${process.env.BASE_URL}/${reservation.rooms[0].RoomType.cover}`,
				capacity: reservation.rooms[0].RoomType.capacity,
			}
		);

		const mailOptions = {
			from: this.from,
			to: email,
			subject: 'Reservation Confirmation',
			html,
			text: htmlToText(html),
		};

		try {
			await this.newTransport().sendMail(mailOptions);
		} catch (err) {
			console.log(err);
		}
	}

	async sendWelcome(user) {
		const html = pug.renderFile(`${__dirname}/../views/email/welcome.pug`, {
			firstName: user.firstName,
			url: `${process.env.CLIENT_URL}/login`,
		});

		const mailOptions = {
			from: this.from,
			to: user.email,
			subject: 'Welcome to Hotel Reservation System',
			html,
			text: htmlToText(html),
		};

		try {
			await this.newTransport().sendMail(mailOptions);
		} catch (err) {
			console.log(err);
		}
	}

	async sendRentalRoomReservationConfirmation(email, reservation) {
		const html = pug.renderFile(
			`${__dirname}/../views/email/rentalRoomReservationConfirmation.pug`,
			{
				firstName: reservation.Resident.firstName,
				lastName: reservation.Resident.lastName,
				hotelName: 'Hotel Awesome',
				roomNumber: reservation.roomNumber,
				phone: reservation.Resident.phone,
				paidBy: reservation.paidBy,
				paidAmount: reservation.totalAmount,
				dateIn: reservation.dateIn,
				dateOut: reservation.dateOut,
			}
		);

		const mailOptions = {
			from: this.from,
			to: email,
			subject: 'Rental Room Reservation Confirmation',
			html,
			text: htmlToText(html),
		};

		// await this.newTransport().sendMail(mailOptions);
		// Do not throw error if email fails to send
		try {
			await this.newTransport().sendMail(mailOptions);
		} catch (err) {
			console.log(err);
		}
	}

	async sendPasswordReset() {
		try {
			await this.send(
				'passwordReset',
				'Your password reset token (valid for only 10 minutes)'
			);
		} catch (err) {
			console.log(err);
		}
	}
};
