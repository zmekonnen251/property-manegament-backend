const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const newTransport = () => {
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
};

class Mailer {
	constructor() {
		this.transporter = newTransport();
		this.configureTemplates();
	}

	configureTemplates() {
		this.transporter.use(
			'compile',
			hbs({
				viewEngine: {
					extName: '.handlebars',
					partialsDir: path.resolve(__dirname, '..', 'views/partials'),
					layoutsDir: path.resolve(__dirname, '..', 'views'),
					defaultLayout: 'base',
				},
				viewPath: path.resolve(__dirname, '..', 'views'),
				extName: '.handlebars',
			})
		);
	}

	async sendWelcomeEmail(email, name) {
		await this.sendEmail({
			to: email,
			subject: 'Welcome to Hotel Reservation System',
			template: 'welcomeEmail',
			context: { name },
		});
	}

	async sendReservationConfirmation(email, reservationDetails) {
		await this.sendEmail({
			to: email,
			subject: 'Hotel Room Reservation Confirmation',
			template: 'reservationConfirmationEmail',
			context: reservationDetails,
		});
	}

	async sendPasswordReset(email, name, resetLink) {
		await this.sendEmail({
			to: email,
			subject: 'Password Reset Request',
			template: 'passwordResetEmail',
			context: { name, resetLink },
		});
	}

	async sendAccountVerification(email, name, verificationLink) {
		await this.sendEmail({
			to: email,
			subject: 'Account Verification',
			template: 'accountVerificationEmail',
			context: { name, verificationLink },
		});
	}

	async sendEmail(options) {
		try {
			await this.transporter.sendMail({
				from: 'Hotel Reservation System <your-email@gmail.com>', // Update with your email
				...options,
			});
			console.log('Email sent:', options.to, options.subject);
		} catch (error) {
			console.error('Error sending email:', error);
		}
	}
}

module.exports = Mailer;
