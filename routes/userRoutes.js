const express = require('express');
const { body } = require('express-validator');
const {
	getIndex,
	getSignup,
	postSignup,
	postLogin,
	postLogout,
} = require('../controllers/UsersController');
const Users = require('../models/Users');

const router = express.Router();

router.get('/', getIndex);
router.get('/signup', getSignup);
router.post(
	'/signup',
	[
		body('name')
			.trim()
			.isAlphanumeric()
			.isLength({ min: 6 })
			.withMessage('Name must be of atleast 6 charecter'),
		body('email')
			.isEmail()
			.withMessage('Please enter valid email address')
			.normalizeEmail()
			.custom((value) => {
				return Users.findOne({ email: value }).then((user) => {
					if (user) {
						return Promise.reject(
							'Email already exist, please use another email.'
						);
					}
				});
			}),
		body('contactNo').trim().isNumeric().withMessage('Contact Must be number'),
		body('password')
			.trim()
			.isLength({ min: 8, max: 16 })
			.withMessage('Password must be of length of 8-16')
			.isAlphanumeric()
			.withMessage('Password must be alphanumeric'),
		body('confirmPassword')
			.trim()
			.custom((value, { req }) => {
				if (value !== req.body.password) {
					throw new Error('Password must match');
				}
				return true;
			}),
	],
	postSignup
);
router.get('/login', getIndex);
router.post(
	'/login',
	[
		body('email')
			.isEmail()
			.withMessage('Please Enter Valid Email')
			.normalizeEmail()
			.trim(),
		body('password')
			.isLength({ min: 8 })
			.withMessage('Password must be valid.')
			.trim(),
	],
	postLogin
);
router.post('/logout', postLogout);
module.exports = router;
