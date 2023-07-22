const Email = require('email-templates');
const path = require('path');

const email = new Email({
	message: {
		from: 'test@example.com',
	},
	// uncomment below to send emails in development/test env:
	// send: true
	transport: {
		jsonTransport: true,
	},
	// <https://github.com/Automattic/juice>
	juice: true,
	// Override juice global settings <https://github.com/Automattic/juice#juicecodeblocks>
	juiceSettings: {
		tableElements: ['TABLE'],
	},
	juiceResources: {
		// set this to `true` (since as of v11 it is `false` by default)
		applyStyleTags: true, // <------------ you need to set this to `true`
		webResources: {
			//
			// this is the relative directory to your CSS/image assets
			// and its default path is `build/`:
			//
			// e.g. if you have the following in the `<head`> of your template:
			// `<link rel="stylesheet" href="style.css" data-inline="data-inline">`
			// then this assumes that the file `build/style.css` exists
			//
			relativeTo: path.resolve('assets'),
			//
			// but you might want to change it to something like:
			// relativeTo: path.join(__dirname, '..', 'assets')
			// (so that you can re-use CSS/images that are used in your web-app)
			//
		},
	},
});
const newEmail = (from) => {
	return new Email({
		message: {
			from,
		},

		transport: {
			jsonTransport: true,
		},

		// uncomment below to send emails in development/test env:
		// send: true,
		juice: true,
		// Override juice global settings <https://github.com/Automattic/juice#juicecodeblocks>
		juiceSettings: {
			tableElements: ['TABLE'],
		},
		juiceResources: {
			// set this to `true` (since as of v11 it is `false` by default)
			applyStyleTags: true, // <------------ you need to set this to `true`
			webResources: {
				//
				// this is the relative directory to your CSS/image assets
				// and its default path is `build/`:
				//
				// e.g. if you have the following in the `<head`> of your template:
				// `<link rel="stylesheet" href="style.css" data-inline="data-inline">`
				// then this assumes that the file `build/style.css` exists
				//
				relativeTo: path.join(__dirname, '..', 'assets'),
				//
				// but you might want to change it to something like:
				// relativeTo: path.join(__dirname, '..', 'assets')
				// (so that you can re-use CSS/images that are used in your web-app)
				//
			},
		},
	});
};

const sendTestEmail = async (user) => {
	const email = newEmail('test@from.com');

	email
		.send({
			template: 'mars',
			message: {
				to: user.email,
				attachments: [
					{
						filename: 'text1.pdf',
						content: 'hello world!',
					},
				],
			},
			locals: {
				name: user?.firstName,
			},
		})
		.then(console.log)
		.catch(console.error);
};

module.exports = {
	sendTestEmail,
};
