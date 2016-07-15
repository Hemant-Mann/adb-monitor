var express = require('express');
var router = express.Router();
var Auth = require('../controllers/auth');

router.get('/verify/:id', function (req, res, next) {
	Auth._init(req, res, next, {method: 'verify'});
});

// Capture  request
var regex = Auth._public();
router.get(regex, Auth._session, function (req, res, next) {
	Auth._init(req, res, next)
});

// Allow post on these methods only
regex = Auth._makeRegex(['login', 'register'], ['html', 'json']);
router.post(regex, function (req, res, next) {
	Auth._init(req, res, next);
});

module.exports = router;
