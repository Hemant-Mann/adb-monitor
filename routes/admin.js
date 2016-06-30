var express = require('express');
var router = express.Router();

var utils = require('../scripts/util');
var Admin = require('../controllers/admin');

// Capture  request
var regex = utils.urlRegex(Admin);
router.get('/', Admin.index);

router.get(regex, function (req, res, next) {

    var method = req.url.match(regex)[1];
    Admin[method](req, res, next);
});

module.exports = router;
