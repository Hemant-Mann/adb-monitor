var express = require('express');
var router = express.Router();
var Account = require('../controllers/account');

// Capture  request
var regex = Account._public();
router.get(regex, function (req, res, next) {
	Account._init(req, res, next)
});

regex = Account._makeRegex(['settings', 'billing'], ['html', 'json']);
router.post(regex, function (req, res, next) {
	Account._init(req, res, next);
});

router.delete('/invoice/:invid', function (req, res, next) {
	Account._init(req, res, next, {method: 'invoice'});
});

module.exports = router;
