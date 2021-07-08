const express = require('express');
const { body } = require('express-validator');
const {
	getContacts,
	getAddContact,
	postAddContact,
	getEditContact,
	postEditContact,
	postDeleteContact,
	getContactDetail,
} = require('../controllers/ContactsController');
const { isAuth } = require('../middleware/isAuth');

const router = express.Router();

router.get('/', isAuth, getContacts);

router.get('/add-contact', isAuth, getAddContact);
router.post(
	'/add-contact',
	[
		body('name')
			.isString()
			.withMessage('Name should only contain charecter'),
		body('contactNo')
			.trim()
			.isNumeric()
			.withMessage('Contact number should be number'),
		body('email')
			.isEmail()
			.withMessage('Please enter valid email address')
			.normalizeEmail(),
		body('address').isString(),
	],
	isAuth,
	postAddContact
);

router.get('/edit-contact/:id', getEditContact);
router.post('/edit-contact', postEditContact);

router.post('/delete-contact', postDeleteContact);
router.get('/contact-detail/:id', getContactDetail);

module.exports = router;
