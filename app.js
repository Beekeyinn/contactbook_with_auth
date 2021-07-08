const path = require('path');

// Packages
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');

// Routes
const contactRoutes = require('./routes/contactRoutes');
const userRoutes = require('./routes/userRoutes');
const emergencyRoutes = require('./routes/emergencyRoutes');
const Users = require('./models/Users');

// mongoDb url
const MONGODB_URL =
	'mongodb+srv://Bikin:Beekeyinn@cluster0.mxy1x.mongodb.net/contactBook';

const app = express();

// creating Session collection in mongodb
const store = new MongoDbStore({
	uri: MONGODB_URL,
	collection: 'sessions',
});

// csrf token initialiation
const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

// using express bodyparser and json parser
app.use(express.urlencoded({ extended: false }));

// Making public and image file staic
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// File Storage:
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const type = req.query.type;
		if (type === 'users' || type === 'contacts') {
			const path = 'images/' + type;
			cb(null, path);
		} else {
			cb('Invalid', null);
		}
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + '-' + file.originalname);
	},
});

// File extension filter
const fileFilter = (req, file, cb) => {
	if (
		file.mimetype === 'image/jpg' ||
		file.mimetype === 'image/jpeg' ||
		file.mimetype === 'image/png'
	) {
		cb(null, true);
	} else {
		cb(null, false);
	}
};

// using Multer
app.use(
	multer({
		storage: storage,
		fileFilter: fileFilter,
	}).single('image')
);

app.use(express.json());

// session
app.use(
	session({
		secret: 'my secret',
		resave: false,
		saveUninitialized: false,
		store: store,
	})
);

// Using CSRF Token
app.use(csrfProtection);

app.use((req, res, next) => {
	if (!req.session.user) {
		return next();
	}
	Users.findById(req.session.user._id)
		.then((user) => {
			if (!user) {
				return next();
			}
			req.user = user;
			next();
		})
		.catch((err) => {
			console.log(err);
		});
});

// using Locals for csrfToken, this return csrf token for every request response
app.use((req, res, next) => {
	res.locals.isAuthenticated = req.session.isLoggedIn;
	res.locals.admin = req.session.isAdmin;
	res.locals.csrfToken = req.csrfToken();
	next();
});

app.use('/emergency', emergencyRoutes);
app.use('/contacts', contactRoutes);
app.use(userRoutes);

mongoose
	.connect(MONGODB_URL, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
		useCreateIndex: true,
	})
	.then((result) => {
		app.listen(3000, () => {
			console.log('Listening to Port: 3000');
		});
	})
	.catch((err) => {
		console.log(err);
	});
