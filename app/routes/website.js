var express = require('express');
var router = express.Router();
var Website = require('../controllers/website');

// Capture  request
var regex = Website._public();
router.get(regex, function (req, res, next) {
	Website._init(req, res, next);
});

regex = Website._makeRegex(['add'], ['html', 'json']);
router.post(regex, function (req, res, next) {
	Website._init(req, res, next);
});

router.get('/stats/:id', function (req, res, next) {
	Website._init(req, res, next, {method: 'stats'});
})
.post('/update/:id', function (req, res, next) {
	Website._init(req, res, next, {method: '_update'});
})
.delete('/delete/:id', function (req, res, next) {
	Website._init(req, res, next, {method: '_delete'});
});

router.param('id', Website._find);

module.exports = router;
