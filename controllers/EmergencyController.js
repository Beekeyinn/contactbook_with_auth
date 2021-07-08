const { validationResult } = require('express-validator');
const EmergencyContacts = require('../models/EmergencyContacts');

exports.getEmergencyContacts = (req, res, next) => {
	EmergencyContacts.find()
		.then((contacts) => {
			const police = contacts.filter((con) => con.service === 'Police');
			const ambulance = contacts.filter((con) => con.service === 'Ambulance');
			const Hospital = contacts.filter((con) => con.service === 'Hospital');
			const Others = contacts.filter((con) => con.service === 'Others');

			return res.render('emergency/contacts', {
				path: 'emergency/contacts',
				title: 'Emergency Contacts',
				police: police,
				ambulance: ambulance,
				hospital: Hospital,
				others: Others,
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getAddEmergencyContact = (req, res, next) => {
	return res.render('emergency/addContact', {
		title: 'Add Emergency Contact',
		path: 'emergency/add-emergency-contact',
		hasErrors: false,
		errorMessage: [],
		validationErrors: [],
		value: {
			name: '',
			contactNo: '',
			place: '',
			service: '',
		},
	});
};

exports.postAddEmergencyContact = (req, res, next) => {
	const name = req.body.name;
	const contactNo = req.body.contactNo;
	const place = req.body.place;
	const service = req.body.service;

	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		console.log(errors.array().map((item) => [item.param, item.msg]));
		return res.render('emergency/addContact', {
			title: 'Add Emergency Contact',
			path: 'emergency/add-emergency-contact',
			hasError: true,
			errorMessage: errors.array().map((item) => item.msg),
			validationErrors: errors.array(),
			value: {
				name: name,
				contactNo: contactNo,
				place: place,
				service: service,
			},
		});
	}

	const contact = EmergencyContacts({
		name: name,
		contactNo: contactNo,
		place: place,
		service: service,
	});

	contact
		.save()
		.then((result) => {
			return res.redirect('/emergency/emergency-contacts');
		})
		.catch((err) => {
			console.log(err);
		});
};
