var express = require('express');
var router = express.Router();

var Home = require('../controllers/home');
var Account = require('../controllers/account');
var track = require('../controllers/tracking').execute;

// Home Page
router.get('/', function (req, res, next) {
	Home._init(req, res, next, {method: 'index'})
});

// Controller - methods
var regex = Home._public();
router.get(regex, function (req, res, next) {
	Home._init(req, res, next)
});

// Tracking url
router.get('/img/_adm.gif', track);

regex = Home._makeRegex(['dashboard'], ['html', 'json']);
router.get(regex, function (req, res, next) {
	Account._init(req, res, next, {method: 'dashboard'});
});

module.exports = router;
