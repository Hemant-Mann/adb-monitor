var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
// var track = require('../controllers/tracking');
var Home = require('../controllers/home');

var regex = Utils.urlRegex(Home);
// Home Page
router.get('/', function (req, res, next) {
	Home._init(req, res, next)
});

// Controller - methods
router.get(regex, function (req, res, next) {
	Home._init(req, res, next)
});

// Tracking url
// router.get('/img/_adm.gif', track);

module.exports = router;
