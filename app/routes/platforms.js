var express = require('express');
var router = express.Router();

var Utils = require('../scripts/util');
var Platforms = require('../controllers/platforms');

router.get('/api/:pid', function (req, res, next) {
	Platforms._init(req, res, next, { method: 'api' });
});

// Controller - methods
var regex = Utils.makeRegex(['getCode', 'create'], ['html', 'json']);
router.get(regex, function (req, res, next) {
	Platforms._init(req, res, next);
});

regex = Utils.makeRegex(['create'], ['html', 'json']);
router.post(regex, function (req, res, next) {
	Platforms._init(req, res, next);
});

// These should be put on the end because urls like /platforms/create or /platform/index
// will interfere with these as Express thinks "create" as an ":id" param
router.post('/:id', function (req, res, next) {
	Platforms._init(req, res, next, {method: 'update'});
})
.delete('/:id', function (req, res, next) {
	Platforms._init(req, res, next, {method: 'delete'});
});

router.param('id', Platforms._find);

module.exports = router;
