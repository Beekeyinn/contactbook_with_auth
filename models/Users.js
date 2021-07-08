const { Schema, model } = require('mongoose');

const usersSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
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
	contactNo: {
		type: String,
		required: true,
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
	contacts: {
		emergencyContacts: [
			{
				emergencyContactId: {
					type: Schema.Types.ObjectId,
					ref: 'EmergencyContact',
					required: true,
				},
			},
		],
		userContacts: [
			{
				contactId: {
					type: Schema.Types.ObjectId,
					ref: 'Contacts',
					required: true,
				},
			},
		],
	},
});

usersSchema.methods.addContact = function (contactId) {
	const userContacts = [...this.contacts.userContacts];
	const adduser = {
		contactId: contactId,
	};
	userContacts.push(adduser);

	this.contacts.userContacts = userContacts;
	return this.save();
};

usersSchema.methods.removeContact = function (id) {
	const updatedUserContacts = this.contacts.userContacts.filter(
		(item) => item.contactId.toString() !== id.toString()
	);
	this.contacts.userContacts = updatedUserContacts;
	return this.save();
};

module.exports = model('Users', usersSchema);
