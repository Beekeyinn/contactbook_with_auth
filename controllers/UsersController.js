const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const Users = require('../models/Users');
const EmergencyContacts = require('../models/EmergencyContacts');

exports.getIndex = (req, res, next) => {
	console.log(req);
	console.log(res);

	return res.render('index', {
		title: 'Contact Book',
		path: '/',
		hasError: false,
		errorMessage: [],
		validationErrors: [],
		oldValue: {
			email: '',
			password: '',
		},
	});
};

exports.postLogin = (req, res, next) => {
	const email = req.body.email;
	const password = req.body.password;

	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).render('index', {
			title: 'Contact Book',
			path: '/',
			hasError: true,
			errorMessage: errors.array().map((e) => e.msg),
			validationErrors: errors.array(),
			oldValue: {
				email: email,
				password: password,
			},
		});
	}

	Users.findOne({ email: email }).then((user) => {
		if (!user) {
			return res.status(422).render('index', {
				title: 'Contact Book',
				path: '/',
				hasError: true,
				errorMessage: ['invalid email or Password'],
				validationErrors: [],
				oldValue: {
					email: email,
					password: password,
				},
			});
		}

		bcrypt
			.compare(password, user.password)
			.then((doMatch) => {
				if (doMatch) {
					req.session.isLoggedIn = true;
					req.session.isAdmin = user.isAdmin;
					req.session.user = user;
					return res.redirect('/contacts');
				}
				return res.status(422).render('index', {
					title: 'Contact Book',
					path: '/',
					hasError: true,
					errorMessage: ['Invalid Email or Password'],
					validationErrors: [],
					oldValue: {
						email: email,
						password: password,
					},
				});
			});
	});
};

exports.getSignup = (req, res, next) => {
	return res.render('users/signup', {
		path: '/signup',
		title: 'Create New Account',
		hasError: false,
		user: [],
		errorMessage: null,
		validationErrors: [],
	});
};

exports.postSignup = (req, res, next) => {
	const name = req.body.name;
	const email = req.body.email;
	const password = req.body.password;
	const confirmPassword = req.body.confirmPassword;
	const address = req.body.address;
	const contactNo = req.body.contactNo;
	const image = req.file;

	if (!image) {
		return res.status(422).render('users/signup', {
			title: 'Create New Account',
			path: '/signup',
			user: {
				name: name,
				email: email,
				address: address,
				contactNo: contactNo,
			},
			errorMessage: ['Attached File is not an image'],
			hasError: true,
			validationErrors: [],
		});
	}
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		console.log(errors);
		return res.status(422).render('users/signup', {
			title: 'Create New Account',
			path: '/signup',
			user: {
				name: name,
				email: email,
				address: address,
				contactNo: contactNo,
			},
			errorMessage: errors.array().map((err) => err.msg),
			hasError: true,
			validationErrors: errors.array(),
		});
	}

	const imageUrl = image.path.replaceAll('\\', '//');
	let hashedPass;
	bcrypt
		.hash(password, 12)
		.then((hashedPassword) => {
			hashedPass = hashedPassword;
			return EmergencyContacts.find();
		})
		.then((eContacts) => {
			const emergencyContacts = eContacts.map(
				(con) => con._id
			);
			let updatedEContacts = [];
			emergencyContacts.forEach((id) => {
				updatedEContacts.push({ emergencyContactId: id });
			});
			const user = new Users({
				name: name,
				email: email,
				contactNo: contactNo,
				password: hashedPass,
				image: imageUrl,
				address: address,
				contacts: {
					emergencyContacts: [...updatedEContacts],
					userContacts: [],
				},
			});
			return user.save();
		})
		.then((result) => {
			console.log('User Created');
			return res.redirect('/');
		})
		.catch((err) => {
			console.log(err);
		});
};

exports.postLogout = (req, res, next) => {
	req.session.destroy((err) => {
		if (err) {
			console.log(err);
		}
		return res.redirect('/');
	});
};
