var express = require('express');
var router = express.Router();

var utils = require('../scripts/util');
var Auth = require('../controllers/auth');

// Capture  request
var regex = utils.urlRegex(Auth);

router.get(regex, function (req, res, next) {

    var method = req.url.match(regex)[1];
    Auth[method](req, res, next);
});

module.exports = router;
