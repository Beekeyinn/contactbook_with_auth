const express = require('express');
const { body } = require('express-validator');
const {
	getAddEmergencyContact,
	postAddEmergencyContact,
	getEmergencyContacts,
} = require('../controllers/EmergencyController');
const { isAdmin, isAuth } = require('../middleware/isAuth');

const router = express.Router();

router.get('/add-emergency-contact',isAuth, isAdmin, getAddEmergencyContact);
router.post(
	'/add-emergency-contact',
	isAuth,
	isAdmin,
	[
		body('contactNo')
			.trim()
			.isNumeric()
			.withMessage('Contact number must be Number.'),
		body('place')
			.trim()
			.isString()
			.isLength({ min: 4 })
			.withMessage('Place must be atleast of length 4'),
		body('service').isEmpty().withMessage('Please Select service'),
	],
	postAddEmergencyContact
);
router.get('/emergency-contacts', isAuth, isAdmin, getEmergencyContacts);
module.exports = router;
