var express = require('express');
var router = express.Router();

var utils = require('../scripts/util');
var Admin = require('../controllers/admin');

// Index page
router.get('/', function (req, res, next) {
	Admin._init(req, res, next, {method: 'index'})
});

// other methods
var regex = utils.urlRegex(Admin);
router.get(regex, function (req, res, next) {
	Admin._init(req, res, next)
});

module.exports = router;
