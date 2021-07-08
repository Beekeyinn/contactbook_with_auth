const { Schema, model } = require('mongoose');

const contactSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	contactNo: {
		type: String,
		required: true,
	},
	address: {
		type: String,
		required: true,
	},
	image: {
		type: String,
		required: true,
	},
});

module.exports = model('Contacts', contactSchema);
