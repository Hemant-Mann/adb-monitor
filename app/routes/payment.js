var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var Payment = require('../controllers/payment');

router.get('/create/:invid', function (req, res, next) {
	Payment._init(req, res, next, {method: 'create'});
});

// Controller - methods
var regex = Utils.urlRegex(Payment);
router.get(regex, function (req, res, next) {
	Payment._init(req, res, next)
});

module.exports = router;
