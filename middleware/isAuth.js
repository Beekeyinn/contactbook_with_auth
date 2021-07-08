exports.isAuth = (req, res, next) => {
	if (!req.session.user) {
		return res.redirect('/');
	}
	next();
};

exports.isAdmin = (req, res, next) => {
	if (!req.session.user.isAdmin) {
		return res.redirect('/contacts');
	}
	next();
};
