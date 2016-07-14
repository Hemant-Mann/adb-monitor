var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var Admin = require('../controllers/admin');

router.get('/', function (req, res, next) {
	Admin._init(req, res, next, {method: 'index'});
});

// Controller - methods
var regex = Utils.urlRegex(Admin);
router.get(regex, function (req, res, next) {
	Admin._init(req, res, next)
});

module.exports = router;
