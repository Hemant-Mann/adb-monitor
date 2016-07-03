var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var Auth = require('../controllers/auth');

router.get('/verify/:id', function (req, res, next) {
	Auth._init(req, res, next, {method: 'verify'});
});

// Capture  request
var regex = Utils.urlRegex(Auth);
router.get(regex, function (req, res, next) {
	Auth._init(req, res, next)
});

// Allow post on these methods only
regex = Utils.makeRegex(['login', 'register'], ['html', 'json']);
router.post(regex, function (req, res, next) {
	Auth._init(req, res, next);
});

module.exports = router;
