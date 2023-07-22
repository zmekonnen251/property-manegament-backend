const { Op } = require('sequelize');
const AppError = require('./appError');

module.exports = (queryString) => {
	const queryObj = queryString;
	const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];

	const filterQueryObj = (obj, excludedFields) => {
		const newObj = {};
		Object.keys(obj).forEach((el) => {
			if (!excludedFields.includes(el)) {
				newObj[el] = obj[el];
			}
		});

		return newObj;
	};

	const filteredQueryObj = filterQueryObj(queryObj, excludedFields);

	// limitFields

	if (queryObj.fields) {
		queryObj.attributes = queryObj.fields.split(',').join(' ');
	}

	// Sort

	if (queryObj.sort) {
		if (queryObj.order) {
			queryObj.order = [[queryObj.sort, queryObj.order]];
		} else {
			queryObj.order = [[queryObj.sort, 'ASC']];
		}
	}

	// Pagination

	if (queryObj.page && queryObj.page !== 'all') {
		const page = parseInt(queryObj.page) || 1;
		const limit = parseInt(queryObj.limit) || 9;
		const ofset = (page - 1) * limit;

		queryObj.offset = ofset;
		queryObj.limit = limit;
	}

	// Search

	if (
		queryObj.search &&
		queryObj.search !== 'undefined' &&
		queryObj.search !== ''
	) {
		queryObj.where = {
			name: {
				[Op.iLike]: `%${queryObj.search}%`,
			},
		};
	}

	// Filter
	// Sample filter query: ?filter={"name":["John","Jane"],"age":[23,24]}
	if (filteredQueryObj) {
		const filterKeys = Object.keys(filteredQueryObj);
		filterKeys.forEach((key) => {
			if (
				filteredQueryObj[key].length > 0 &&
				filteredQueryObj[key] !== 'undefined'
			) {
				queryObj.where = {
					...queryObj.where,
					[key]: filteredQueryObj[key],
				};
			} else if (filteredQueryObj[key] === 'undefined') {
				delete queryObj[key];
			}

			delete queryObj[key];
		});
	}

	delete queryObj.sort;
	delete queryObj.fields;
	delete queryObj.search;
	delete queryObj.page;

	return queryObj;
};
