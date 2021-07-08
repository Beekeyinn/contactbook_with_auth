const { Schema, model } = require('mongoose');

const emergencySchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	contactNo: {
		type: String,
		required: true,
	},
	place: {
		type: String,
		required: true,
	},
	service: {
		type: String,
		required: true,
	},
});

module.exports = model('EmergencyContact',emergencySchema)
