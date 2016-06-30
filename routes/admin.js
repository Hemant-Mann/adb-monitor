var express = require('express');
var router = express.Router();

var utils = require('../scripts/util');
var Admin = require('../controllers/admin');

var regex = utils.urlRegex(Admin);

// Index page
router.get('/', function (req, res, next) {
	Admin._init(req, res, next)
});

// other methods
router.get(regex, function (req, res, next) {
	Admin._init(req, res, next)
});

module.exports = router;
