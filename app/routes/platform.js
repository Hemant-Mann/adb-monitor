var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var Platform = require('../controllers/platform');

// var regex = Utils.urlRegex(Platform);
// Platform Page
router.get('/', function (req, res, next) {
	Platform._init(req, res, next);
});

router.get('/:id', function (req, res, next) {
	Platform.method = 'show';
	Platform._init(req, res, next);
})
.post('/:id', function (req, res, next) {
	Platform.method = 'update';
	Platform._init(req, res, next);
})
.delete('/:id', function (req, res, next) {
	Platform.method = 'delete';
	Platform._init(req, res, next);
});

// Controller - methods
var regex = Utils.makeRegex(['create'], ['html']);
router.get(regex, function (req, res, next) {
	Platform._init(req, res, next);
})
.post(regex, function (req, res, next) {
	Platform._init(req, res, next);
});

module.exports = router;
