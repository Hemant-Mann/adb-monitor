var express = require('express');
var router = express.Router();
var Admin = require('../controllers/admin');

router.get('/', function (req, res, next) {
	Admin._init(req, res, next, {method: 'index'});
});

// Controller - methods
var regex = Admin._public();
router.get(regex, function (req, res, next) {
	Admin._init(req, res, next)
});

router.get('/info/:model/:id', function (req, res, next) {
	Admin._init(req, res, next, {method: 'info'});
});

router.get('/update/:model/:id', function (req, res, next) {
	Admin._init(req, res, next, {method: 'update'});
})
.post('/update/:model/:id', function (req, res, next) {
	Admin._init(req, res, next, {method: '_update'});
})

module.exports = router;
