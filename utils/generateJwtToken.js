const jwt = require('jsonwebtoken');

module.exports = (type, user) => {
	if (type === 'refresh') {
		const payload = {
			id: user.id,
			email: user.email,
		};
		return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: process.env.REFRESH_TOKEN_LIFE,
		});
	}

	if (type === 'access') {
		const payload = {
			id: user.id,
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			photo: user.photo,
			role: user.role,
		};
		return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: process.env.ACCESS_TOKEN_LIFE,
		});
	}

	return null;
};
