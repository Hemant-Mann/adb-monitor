var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var Home = require('../controllers/home');
var track = require('../controllers/tracking');

// Home Page
router.get('/', function (req, res, next) {
	Home._init(req, res, next, {method: 'index'})
});

// Controller - methods
var regex = Utils.urlRegex(Home);
router.get(regex, function (req, res, next) {
	Home._init(req, res, next)
});

// Tracking url
router.get('/img/_adm.gif', track);

module.exports = router;
