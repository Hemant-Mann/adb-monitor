var express = require('express');
var router = express.Router();
var Payment = require('../controllers/payment');

router.get('/create/:invid', function (req, res, next) {
	Payment._init(req, res, next, {method: 'create'});
});

// Controller - methods
var regex = Payment._public();
router.get(regex, function (req, res, next) {
	Payment._init(req, res, next)
});

module.exports = router;
