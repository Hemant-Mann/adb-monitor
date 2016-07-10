var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var Account = require('../controllers/account');

// Capture  request
var regex = Utils.urlRegex(Account);
router.get(regex, function (req, res, next) {
	Account._init(req, res, next)
});

regex = Utils.makeRegex(['settings', 'billing'], ['html', 'json']);
router.post(regex, function (req, res, next) {
	Account._init(req, res, next);
});

module.exports = router;
