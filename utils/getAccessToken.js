const getAcessToken = (req) => {
	const { accessToken } = req;
	if (accessToken) {
		return accessToken;
	}
};

module.exports = getAcessToken;
