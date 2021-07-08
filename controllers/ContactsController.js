const { validationResult } = require('express-validator');
const Contacts = require('../models/Contacts');
const { deleteFile } = require('../utils/file');

exports.getContacts = (req, res, next) => {
	req.user
		.populate('contacts.userContacts.contactId')
		.execPopulate()
		.then((result) => {
			const userContacts = result.contacts.userContacts.map(
				(item) => item
			);
			console.log(userContacts);
			return res.render('contacts/contacts', {
				path: '/contacts',
				title: 'Contacts',
				userContacts: userContacts,
			});
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getAddContact = (req, res, next) => {
	return res.render('contacts/editContact', {
		path: 'contacts/add-contact',
		title: 'Add Contact',
		contact: {
			name: '',
			email: '',
			contactNo: '',
			address: '',
		},
		editing: false,
		hasError: false,
		errorMessage: [],
		validationErrors: [],
	});
};

exports.postAddContact = (req, res, next) => {
	const name = req.body.name;
	const email = req.body.email;
	const contactNo = req.body.contactNo;
	const address = req.body.address;
	const image = req.file;

	if (!image) {
		return res.status(422).render('contacts/editContact', {
			path: 'contacts/add-contact',
			title: 'Add Contact',
			contact: {
				name: name,
				email: email,
				contactNo: contactNo,
				address: address,
			},
			editMode: false,
			hasError: true,
			errorMessage: ['Invalid File'],
			validationErrors: [],
		});
	}

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('contacts/editContact', {
			path: 'contacts/add-contact',
			title: 'Add Contact',
			contact: {
				name: name,
				email: email,
				contactNo: contactNo,
				address: address,
			},
			editing: false,
			hasError: true,
			errorMessage: errors.array().map((e) => e.msg),
			validationErrors: errors.array(),
		});
	}

	const imageUrl = '/' + image.path.replaceAll('\\', '//');

	const contact = new Contacts({
		name: name,
		email: email,
		address: address,
		contactNo: contactNo,
		image: imageUrl,
	});
	contact
		.save()
		.then((result) => {
			console.log(result);

			return req.user.addContact(result._id);
		})
		.then((result) => {
			console.log('user: ', result);
			return res.redirect('/contacts');
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getEditContact = (req, res, next) => {
	const id = req.params.id;
	const editMode = req.query.edit;
	if (!editMode) {
		return res.redirect('/contacts');
	}
	Contacts.findById(id).then((contact) => {
		console.log(contact);
		if (!contact) {
			return res.redirect('/contacts');
		}
		return res.render('contacts/editContact', {
			path: 'contacts/edit-contact',
			title: 'Edit Contact',
			editing: editMode,
			contact: contact,
			hasError: false,
			errorMessage: [],
			validationErrors: [],
		});
	});
};

exports.postEditContact = (req, res, next) => {
	const id = req.body.id;
	const name = req.body.name;
	const email = req.body.email;
	const contactNo = req.body.contactNo;
	const address = req.body.address;
	const image = req.file;

	if (!image) {
		return res.status(422).render('contacts/editContact', {
			path: 'contacts/add-contact',
			title: 'Add Contact',
			contact: {
				name: name,
				email: email,
				contactNo: contactNo,
				address: address,
			},
			editing: true,
			hasError: true,
			errorMessage: ['Invalid File'],
			validationErrors: [],
		});
	}

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('contacts/editContact', {
			path: 'contacts/add-contact',
			title: 'Add Contact',
			contact: {
				name: name,
				email: email,
				contactNo: contactNo,
				address: address,
			},
			editing: true,
			hasError: true,
			errorMessage: errors.array().map((e) => e.msg),
			validationErrors: errors.array(),
		});
	}

	const imageUrl = image.path.replaceAll('\\', '//');
	Contacts.findById(id)
		.then((contact) => {
			contact.name = name;
			contact.email = email;
			contact.contactNo = contactNo;
			contact.address = address;
			deleteFile(contact.image);
			contact.image = imageUrl;
			return contact.save();
		})
		.then((result) => {
			console.log(result);
			return res.redirect('/contacts');
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postDeleteContact = (req, res, next) => {
	const id = req.body.id;
	Contacts.findById(id)
		.then((contact) => {
			if (!contact) {
				console.log('No Contact found');
				return;
			}
			deleteFile(contact.image);
			return Contacts.findByIdAndDelete(id);
		})
		.then((result) => {
			return req.user.removeContact(id);
		})
		.then((result) => {
			console.log('Contact Deleted');
			return res.redirect('/contacts');
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.getContactDetail = (req, res, next) => {
	const id = req.params.id;

	Contacts.findById(id)
		.then((contact) => {
			if (!contact) {
				return res.redirect('/contacts');
			}
			return res.render('contacts/contactDetail', {
				path: 'contacts/contact-detail',
				title: contact.name,
				contact: contact,
			});
		})
		.catch((err) => {
			console.log(err);
		});
};
